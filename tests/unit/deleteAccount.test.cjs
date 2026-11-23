const {test} = require('node:test');
const assert = require('node:assert/strict');
const {
  createDeleteAccountHandler,
} = require('../../functions/pricing/services/deleteAccount');
const {
  isAccountDeletionInProgress,
  writeAccountProfileUnlessDeleting,
} = require('../../functions/pricing/services/accountProfileWriter');
const {
  cancelSubscriptionForDeletedAccount,
} = require('../../functions/pricing/services/stripeWebhookUtils');

class HttpsError extends Error {
  constructor(code, message, details) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

const now = () => 1_800_000_000_000;
const context = {
  auth: {
    uid: 'alice',
    token: {
      auth_time: Math.floor(now() / 1000),
      firebase: {sign_in_provider: 'password'},
    },
  },
};

const fixture = (options = {}) => {
  let userData = options.userData === undefined ?
    {firstName: 'Alice', subscription: null} :
    options.userData;
  let deletionData = options.deletionData || null;
  let recursiveDeletes = 0;
  let authDeletes = 0;
  const searchDeletes = [];
  const events = [];

  const deletionRef = {
    get: async () => ({
      exists: Boolean(deletionData),
      data: () => deletionData,
    }),
    set: async (value) => {
      if (value.status === 'complete' && options.completionFailureCount > 0) {
        options.completionFailureCount -= 1;
        throw new Error('Firestore unavailable');
      }
      deletionData = {...deletionData, ...value};
    },
  };
  const userRef = {
    get: async () => ({
      exists: Boolean(userData),
      data: () => userData,
    }),
  };
  const db = {
    collection: (name) => ({doc: (id) => {
      if (name === 'accountDeletions') return deletionRef;
      if (name === 'searchUsage') return {path: `searchUsage/${id}`};
      throw new Error(`Unexpected collection ${name}`);
    }}),
    doc: (path) => path.startsWith('accountDeletions/') ?
      deletionRef :
      userRef,
    runTransaction: async (callback) =>
      callback({
        get: (reference) => reference.get(),
        set: (_reference, value) => {
          deletionData = {...deletionData, ...value};
        },
      }),
    recursiveDelete: async (ref) => {
      if (ref !== userRef) {
        events.push('search');
        searchDeletes.push(ref.path);
        if (options.searchFailureAt === searchDeletes.length) {
          throw new Error('Search cleanup unavailable');
        }
        return;
      }
      events.push('profile');
      recursiveDeletes += 1;
      if (options.recursiveFailureCount > 0) {
        options.recursiveFailureCount -= 1;
        throw new Error('Firestore unavailable');
      }
      userData = null;
    },
  };

  const admin = {
    auth: () => ({
      deleteUser: async () => {
        events.push('auth');
        authDeletes += 1;
        if (options.authDeleted) {
          const error = new Error('Not found');
          error.code = 'auth/user-not-found';
          throw error;
        }
        if (options.authFailureCount > 0) {
          options.authFailureCount -= 1;
          const error = new Error('Auth unavailable');
          error.code = 'auth/internal-error';
          throw error;
        }
        options.authDeleted = true;
      },
    }),
  };

  const handler = createDeleteAccountHandler({
    db,
    admin,
    stripeFactory: () => options.stripe,
    FieldValue: {serverTimestamp: () => 'server-time'},
    HttpsError,
    logger: {error() {}, warn() {}},
    now: options.now || now,
  });

  return {
    handler,
    deletionData: () => deletionData,
    recursiveDeletes: () => recursiveDeletes,
    authDeletes: () => authDeletes,
    searchDeletes: () => searchDeletes,
    events: () => events,
  };
};

const createStripe = () => {
  const calls = [];
  let subscriptionStatus = 'active';
  let customerDeleted = false;
  const stripe = {
    customers: {
      search: async () => ({
        data: [{id: 'cus_alice'}],
        next_page: null,
      }),
      retrieve: async () =>
        customerDeleted ? {id: 'cus_alice', deleted: true} : {id: 'cus_alice'},
      del: async (id) => {
        calls.push(['customer.delete', id]);
        customerDeleted = true;
        return {id, deleted: true};
      },
    },
    checkout: {
      sessions: {
        list: async () => ({data: [], has_more: false}),
        expire: async (id) => calls.push(['session.expire', id]),
      },
    },
    subscriptions: {
      list: async () => ({
        data: [{id: 'sub_alice', status: subscriptionStatus}],
        has_more: false,
      }),
      retrieve: async (id) => ({
        id,
        customer: 'cus_alice',
        status: subscriptionStatus,
      }),
      cancel: async (id) => {
        calls.push(['subscription.cancel', id]);
        subscriptionStatus = 'canceled';
        return {id, status: subscriptionStatus};
      },
    },
  };
  return {
    stripe,
    calls,
    get subscriptionStatus() {
      return subscriptionStatus;
    },
  };
};

test('requires a supported registered provider and recent authentication', async () => {
  const f = fixture();

  for (const invalidContext of [
    {},
    {
      auth: {
        uid: 'alice',
        token: {
          auth_time: Math.floor(now() / 1000),
          firebase: {sign_in_provider: 'anonymous'},
        },
      },
    },
    {
      auth: {
        uid: 'alice',
        token: {
          auth_time: Math.floor(now() / 1000),
          firebase: {sign_in_provider: 'github.com'},
        },
      },
    },
    {
      auth: {
        uid: 'alice',
        token: {
          auth_time: Math.floor(now() / 1000) + 1,
          firebase: {sign_in_provider: 'password'},
        },
      },
    },
  ]) {
    await assert.rejects(f.handler({}, invalidContext), HttpsError);
  }
});

test('recursive cleanup runs even when the profile document is absent', async () => {
  const f = fixture({userData: null});
  const result = await f.handler({}, context);

  assert.deepEqual(result, {success: true});
  assert.equal(f.recursiveDeletes(), 1);
  assert.equal(f.authDeletes(), 1);
  assert.equal(f.deletionData().status, 'complete');
});

test('verifies Stripe subscription state and cancels before deleting records', async () => {
  const stripeMock = createStripe();
  const f = fixture({
    userData: {
      stripeCustomerId: 'cus_alice',
      subscription: {status: 'canceled', stripeSubscriptionId: 'sub_alice'},
    },
    stripe: stripeMock.stripe,
  });
  const previousKey = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = 'test-secret';
  try {
    const result = await f.handler({}, context);
    assert.deepEqual(result, {success: true});
    assert.deepEqual(
        stripeMock.calls.map(([operation]) => operation),
        ['subscription.cancel', 'customer.delete'],
    );
    assert.equal(f.deletionData().status, 'complete');
  } finally {
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousKey;
  }
});

test('does not delete an active billing profile when Stripe is unavailable', async () => {
  const f = fixture({
    userData: {subscription: {status: 'active'}},
  });
  const previousKey = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY;
  try {
    await assert.rejects(f.handler({}, context), {
      code: 'failed-precondition',
    });
    assert.equal(f.recursiveDeletes(), 0);
    assert.equal(f.authDeletes(), 0);
    assert.equal(f.deletionData().status, 'in_progress');
  } finally {
    if (previousKey !== undefined) process.env.STRIPE_SECRET_KEY = previousKey;
  }
});

test('retries safely after Stripe cleanup succeeds but Firestore cleanup fails', async () => {
  const stripeMock = createStripe();
  const f = fixture({
    userData: {stripeCustomerId: 'cus_alice'},
    stripe: stripeMock.stripe,
    recursiveFailureCount: 1,
  });
  const previousKey = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = 'test-secret';
  try {
    await assert.rejects(f.handler({}, context), {
      code: 'failed-precondition',
    });
    assert.equal(f.deletionData().status, 'in_progress');

    assert.deepEqual(await f.handler({}, context), {success: true});
    assert.equal(f.recursiveDeletes(), 2);
    assert.equal(f.authDeletes(), 1);
    assert.equal(
        stripeMock.calls.filter(([operation]) =>
          operation === 'subscription.cancel').length,
        1,
    );
  } finally {
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousKey;
  }
});

test('preserves locked account data when Stripe cancellation fails and retries', async () => {
  const stripeMock = createStripe();
  const cancel = stripeMock.stripe.subscriptions.cancel;
  let failCancellation = true;
  stripeMock.stripe.subscriptions.cancel = async (...args) => {
    if (failCancellation) {
      const error = new Error('Stripe unavailable');
      error.code = 'api_connection_error';
      throw error;
    }
    return cancel(...args);
  };
  const f = fixture({
    userData: {stripeCustomerId: 'cus_alice'},
    stripe: stripeMock.stripe,
  });
  const previousKey = process.env.STRIPE_SECRET_KEY;
  process.env.STRIPE_SECRET_KEY = 'test-secret';
  try {
    await assert.rejects(f.handler({}, context), {
      code: 'failed-precondition',
    });
    assert.equal(f.recursiveDeletes(), 0);
    assert.equal(f.authDeletes(), 0);
    assert.equal(f.deletionData().status, 'in_progress');

    failCancellation = false;
    assert.deepEqual(await f.handler({}, context), {success: true});
    assert.equal(f.recursiveDeletes(), 1);
    assert.equal(f.deletionData().status, 'complete');
  } finally {
    if (previousKey === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previousKey;
  }
});

test('retries safely when Auth deletion fails after Firestore cleanup', async () => {
  const f = fixture({authFailureCount: 1});

  await assert.rejects(f.handler({}, context), {
    code: 'failed-precondition',
  });
  assert.equal(f.recursiveDeletes(), 1);
  assert.equal(f.deletionData().stage, 'auth_cleanup');

  assert.deepEqual(await f.handler({}, context), {success: true});
  assert.equal(f.recursiveDeletes(), 2);
  assert.equal(f.authDeletes(), 2);
  assert.equal(f.deletionData().status, 'complete');
});

test('retry completes safely if Auth was deleted before completion was recorded', async () => {
  let currentTime = now();
  const f = fixture({
    completionFailureCount: 1,
    now: () => currentTime,
  });
  const tokenContext = {
    auth: {
      uid: 'alice',
      token: {
        auth_time: Math.floor(now() / 1000),
        firebase: {sign_in_provider: 'password'},
      },
    },
  };

  await assert.rejects(f.handler({}, tokenContext), {
    code: 'failed-precondition',
  });
  assert.equal(f.deletionData().stage, 'auth_cleanup');

  currentTime += 20 * 60 * 1000;
  assert.deepEqual(await f.handler({}, tokenContext), {success: true});
  assert.equal(f.deletionData().status, 'complete');
  assert.equal(f.authDeletes(), 2);
});

test('completed deletion retries are idempotent and do not repeat cleanup', async () => {
  const f = fixture({
    deletionData: {status: 'complete'},
  });

  assert.deepEqual(await f.handler({}, context), {success: true});
  assert.equal(f.recursiveDeletes(), 0);
  assert.equal(f.authDeletes(), 0);
});

test('resume-only requests require an existing deletion tombstone', async () => {
  const f = fixture();

  await assert.rejects(
      f.handler({resumePendingDeletion: true}, context),
      {code: 'failed-precondition'},
  );
  assert.equal(f.recursiveDeletes(), 0);
  assert.equal(f.authDeletes(), 0);
});

test('delayed Stripe writes cannot recreate or update a deleting profile', async () => {
  let deletionInProgress = true;
  let userExists = true;
  let writes = 0;
  const db = {
    doc: (path) => ({
      path,
      get: async () => ({
        exists: path.startsWith('accountDeletions/') ?
          deletionInProgress :
          userExists,
      }),
    }),
    runTransaction: async (callback) =>
      callback({
        get: (reference) => reference.get(),
        set: () => {
          writes += 1;
        },
      }),
  };

  assert.equal(
      await writeAccountProfileUnlessDeleting(db, 'alice', {
        subscription: {status: 'active'},
      }),
      false,
  );
  assert.equal(writes, 0);

  deletionInProgress = false;
  userExists = false;
  assert.equal(
      await writeAccountProfileUnlessDeleting(db, 'alice', {
        subscription: {status: 'active'},
      }),
      false,
  );
  assert.equal(writes, 0);

  userExists = true;
  assert.equal(
      await writeAccountProfileUnlessDeleting(db, 'alice', {
        subscription: {status: 'active'},
      }),
      true,
  );
  assert.equal(writes, 1);
});

test('delayed Stripe events cancel active subscriptions without restoring the profile', async () => {
  let subscriptionStatus = 'active';
  let cancellations = 0;
  const stripe = {
    subscriptions: {
      retrieve: async (id) => ({id, status: subscriptionStatus}),
      cancel: async (id) => {
        cancellations += 1;
        subscriptionStatus = 'canceled';
        return {id, status: subscriptionStatus};
      },
    },
  };
  const db = {
    doc: () => ({
      get: async () => ({exists: true}),
    }),
  };

  assert.equal(await isAccountDeletionInProgress(db, 'alice'), true);
  await cancelSubscriptionForDeletedAccount(stripe, 'alice', 'sub_alice');
  await cancelSubscriptionForDeletedAccount(stripe, 'alice', 'sub_alice');
  assert.equal(cancellations, 1);
  assert.equal(subscriptionStatus, 'canceled');
});


const withoutStripe = async (operation) => {
  const previous = process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_SECRET_KEY;
  try { await operation(); } finally {
    if (previous === undefined) delete process.env.STRIPE_SECRET_KEY;
    else process.env.STRIPE_SECRET_KEY = previous;
  }
};

test('search cleanup completes before profile and Auth deletion', async () => {
  await withoutStripe(async () => {
    const f = fixture();
    assert.deepEqual(await f.handler({}, context), {success: true});
    assert.deepEqual(f.events(), ['search', 'search', 'profile', 'auth']);
    assert.equal(new Set(f.searchDeletes()).size, 2);
  });
});

test('partial search cleanup failure stays locked and resume completes', async () => {
  await withoutStripe(async () => {
    const f = fixture({searchFailureAt: 2});
    await assert.rejects(f.handler({}, context), (e) => e.details.deletionPending === true);
    assert.equal(f.deletionData().status, 'in_progress');
    assert.equal(f.deletionData().stage, 'search_cleanup');
    assert.equal(f.recursiveDeletes(), 0);
    assert.equal(f.authDeletes(), 0);
    assert.deepEqual(await f.handler({resumePendingDeletion: true}, context), {success: true});
    assert.equal(f.searchDeletes().length, 4);
    assert.equal(f.recursiveDeletes(), 1);
    assert.equal(f.authDeletes(), 1);
    assert.equal(f.deletionData().status, 'complete');
  });
});

test('completed deletion does not repeat search cleanup', async () => {
  await withoutStripe(async () => {
    const f = fixture({deletionData: {status: 'complete'}});
    assert.deepEqual(await f.handler({}, context), {success: true});
    assert.equal(f.searchDeletes().length, 0);
  });
});
