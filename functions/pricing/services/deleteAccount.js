const functions = require('firebase-functions/v1');
const {FieldValue} = require('firebase-admin/firestore');
const {admin, db} = require('../../config/firebase');
const createStripeClient = require('stripe');

const SUPPORTED_PROVIDERS = new Set(['password', 'google.com']);
const TERMINAL_SUBSCRIPTION_STATUSES = new Set([
  'canceled',
  'incomplete_expired',
]);
const BILLING_STATUSES_REQUIRING_CLEANUP = new Set([
  'active',
  'trialing',
  'past_due',
  'unpaid',
  'incomplete',
  'paused',
]);
const MAX_AUTH_AGE_SECONDS = 10 * 60;
const MAX_STRIPE_PAGES = 10;

const verifyRecentAuthentication = (
    context,
    now,
    HttpsError = functions.https.HttpsError,
) => {
  const provider = context.auth?.token?.firebase?.sign_in_provider;
  if (!context.auth?.uid || provider === 'anonymous') {
    throw new HttpsError(
        'unauthenticated',
        'A registered account is required.',
    );
  }
  if (!SUPPORTED_PROVIDERS.has(provider)) {
    throw new HttpsError(
        'failed-precondition',
        'Account deletion is not supported for this sign-in provider.',
    );
  }

  const authTime = context.auth.token.auth_time;
  const age = Math.floor(now() / 1000) - authTime;
  if (
    typeof authTime !== 'number' ||
    !Number.isFinite(authTime) ||
    age < 0 ||
    age > MAX_AUTH_AGE_SECONDS
  ) {
    throw new HttpsError(
        'failed-precondition',
        'Please sign in again before deleting your account.',
    );
  }
};

const getKnownStripeIds = (userData = {}) => ({
  customerIds: [
    userData.stripeCustomerId,
    userData.subscription?.stripeCustomerId,
  ].filter((value) => typeof value === 'string' && value),
  subscriptionId:
    typeof userData.subscription?.stripeSubscriptionId === 'string' ?
      userData.subscription.stripeSubscriptionId :
      null,
});

const isMissingStripeResource = (error) =>
  error?.code === 'resource_missing' ||
  error?.raw?.code === 'resource_missing';

const listStripePages = async (fetchPage, label) => {
  const records = [];
  let startingAfter;

  for (let page = 0; page < MAX_STRIPE_PAGES; page += 1) {
    const result = await fetchPage(startingAfter);
    records.push(...(result.data || []));

    if (!result.has_more) {
      return records;
    }

    const lastRecord = result.data?.[result.data.length - 1];
    if (!lastRecord?.id) {
      throw new Error(`Stripe ${label} pagination returned no continuation ID.`);
    }
    startingAfter = lastRecord.id;
  }

  throw new Error(`Stripe ${label} pagination exceeded the safety limit.`);
};

const createDeleteAccountHandler = ({
  db,
  admin: adminSdk,
  stripeFactory = createStripeClient,
  FieldValue: firestoreFieldValue = FieldValue,
  HttpsError = functions.https.HttpsError,
  logger = console,
  now = () => Date.now(),
}) => {
  const setStage = async (deletionRef, stage) => {
    await deletionRef.set(
        {
          stage,
          updatedAt: firestoreFieldValue.serverTimestamp(),
        },
        {merge: true},
    );
  };

  const discoverStripeCustomers = async (stripe, uid, knownCustomerIds) => {
    const customerIds = new Set(knownCustomerIds);
    let page;

    for (let pageNumber = 0; pageNumber < MAX_STRIPE_PAGES; pageNumber += 1) {
      const result = await stripe.customers.search({
        query: `metadata['firebaseUID']:'${uid}'`,
        limit: 100,
        ...(page ? {page} : {}),
      });

      for (const customer of result.data || []) {
        if (customer?.id && !customer.deleted) customerIds.add(customer.id);
      }

      if (!result.next_page) return [...customerIds];
      page = result.next_page;
    }

    throw new Error('Stripe customer search exceeded the safety limit.');
  };

  const cancelCustomerBilling = async (stripe, uid, customerId) => {
    const openSessions = await listStripePages(
        (startingAfter) => stripe.checkout.sessions.list({
          customer: customerId,
          status: 'open',
          limit: 100,
          ...(startingAfter ? {starting_after: startingAfter} : {}),
        }),
        'checkout sessions',
    );

    for (const session of openSessions) {
      try {
        await stripe.checkout.sessions.expire(session.id);
      } catch (error) {
        if (!isMissingStripeResource(error)) throw error;
      }
    }

    const subscriptions = await listStripePages(
        (startingAfter) => stripe.subscriptions.list({
          customer: customerId,
          status: 'all',
          limit: 100,
          ...(startingAfter ? {starting_after: startingAfter} : {}),
        }),
        'subscriptions',
    );

    for (const listedSubscription of subscriptions) {
      let subscription = listedSubscription;
      try {
        subscription = await stripe.subscriptions.retrieve(
            listedSubscription.id,
        );
      } catch (error) {
        if (isMissingStripeResource(error)) continue;
        throw error;
      }

      if (TERMINAL_SUBSCRIPTION_STATUSES.has(subscription.status)) continue;

      try {
        const canceled = await stripe.subscriptions.cancel(
            subscription.id,
            {},
            {idempotencyKey: `account-deletion-${uid}-${subscription.id}`},
        );
        if (!TERMINAL_SUBSCRIPTION_STATUSES.has(canceled?.status)) {
          throw new Error(
              `Stripe did not confirm cancellation for ${subscription.id}.`,
          );
        }
      } catch (error) {
        if (!isMissingStripeResource(error)) throw error;
      }
    }
  };

  const cleanupStripeCustomer = async (stripe, uid, customerId) => {
    let customer;
    try {
      customer = await stripe.customers.retrieve(customerId);
    } catch (error) {
      if (isMissingStripeResource(error)) return;
      throw error;
    }
    if (customer?.deleted) return;

    await cancelCustomerBilling(stripe, uid, customerId);

    try {
      const deletedCustomer = await stripe.customers.del(
          customerId,
          {},
          {idempotencyKey: `account-deletion-${uid}-${customerId}`},
      );
      if (deletedCustomer?.deleted !== true) {
        throw new Error(`Stripe did not confirm deletion for ${customerId}.`);
      }
    } catch (error) {
      if (!isMissingStripeResource(error)) throw error;
    }
  };

  return async (data, context) => {
    if (!context.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Login required.');
    }

    const uid = context.auth.uid;
    const userRef = db.doc(`users/${uid}`);
    const deletionRef = db.doc(`accountDeletions/${uid}`);
    const currentDeletion = await deletionRef.get();
    if (currentDeletion.exists && currentDeletion.data()?.status === 'complete') {
      return {success: true};
    }
    const hasPendingDeletion =
      currentDeletion.exists &&
      currentDeletion.data()?.status === 'in_progress';
    if (data?.resumePendingDeletion === true && !hasPendingDeletion) {
      throw new HttpsError(
          'failed-precondition',
          'There is no pending account deletion to resume.',
      );
    }
    if (!hasPendingDeletion) {
      verifyRecentAuthentication(context, now, HttpsError);
    }

    const alreadyComplete = await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(deletionRef);
      if (snapshot.exists && snapshot.data()?.status === 'complete') return true;

      transaction.set(
          deletionRef,
          {
            status: 'in_progress',
            stage: 'started',
            createdAt: snapshot.exists ?
              snapshot.data()?.createdAt || firestoreFieldValue.serverTimestamp() :
              firestoreFieldValue.serverTimestamp(),
            updatedAt: firestoreFieldValue.serverTimestamp(),
          },
          {merge: true},
      );
      return false;
    });

    if (alreadyComplete) return {success: true};

    try {
      const userSnapshot = await userRef.get();
      const {customerIds: knownCustomerIds, subscriptionId} =
        getKnownStripeIds(userSnapshot.exists ? userSnapshot.data() : {});
      const subscriptionStatus = userSnapshot.exists ?
        userSnapshot.data()?.subscription?.status :
        null;
      const secretKey = process.env.STRIPE_SECRET_KEY;
      const hasKnownStripeData =
        knownCustomerIds.length > 0 ||
        subscriptionId ||
        BILLING_STATUSES_REQUIRING_CLEANUP.has(subscriptionStatus);

      if (!secretKey && hasKnownStripeData) {
        throw new HttpsError(
            'failed-precondition',
            'Billing cleanup is unavailable. Retry account deletion when billing is configured.',
            {deletionPending: true},
        );
      }

      if (secretKey) {
        const stripe = stripeFactory(secretKey);
        const customerIds = await discoverStripeCustomers(
            stripe,
            uid,
            knownCustomerIds,
        );

        if (subscriptionId) {
          try {
            const subscription =
              await stripe.subscriptions.retrieve(subscriptionId);
            const subscriptionCustomerId =
              typeof subscription.customer === 'string' ?
                subscription.customer :
                subscription.customer?.id;
            if (subscriptionCustomerId) customerIds.push(subscriptionCustomerId);
          } catch (error) {
            if (!isMissingStripeResource(error)) throw error;
          }
        }

        await setStage(deletionRef, 'stripe_cleanup');
        for (const customerId of new Set(customerIds)) {
          await cleanupStripeCustomer(stripe, uid, customerId);
        }

        if (subscriptionId) {
          let subscription;
          try {
            subscription = await stripe.subscriptions.retrieve(subscriptionId);
          } catch (error) {
            if (!isMissingStripeResource(error)) throw error;
          }
          if (
            subscription &&
            !TERMINAL_SUBSCRIPTION_STATUSES.has(subscription.status)
          ) {
            const canceled = await stripe.subscriptions.cancel(
                subscriptionId,
                {},
                {idempotencyKey: `account-deletion-${uid}-${subscriptionId}`},
            );
            if (!TERMINAL_SUBSCRIPTION_STATUSES.has(canceled?.status)) {
              throw new Error(
                  `Stripe did not confirm cancellation for ${subscriptionId}.`,
              );
            }
          }
        }
      }

      await setStage(deletionRef, 'firestore_cleanup');
      await db.recursiveDelete(userRef);

      await setStage(deletionRef, 'auth_cleanup');
      try {
        await adminSdk.auth().deleteUser(uid);
      } catch (error) {
        if (error?.code !== 'auth/user-not-found') throw error;
      }

      await deletionRef.set(
          {
            status: 'complete',
            stage: 'complete',
            completedAt: firestoreFieldValue.serverTimestamp(),
            updatedAt: firestoreFieldValue.serverTimestamp(),
          },
          {merge: true},
      );

      return {success: true};
    } catch (error) {
      logger.error('Account deletion failed:', {
        uid,
        code: error?.code,
        message: error?.message,
      });

      if (error instanceof HttpsError) {
        throw new HttpsError(
            error.code,
            error.message,
            {deletionPending: true},
        );
      }
      throw new HttpsError(
          'failed-precondition',
          'Account deletion is paused. Your data is locked; retry deletion to continue.',
          {deletionPending: true},
      );
    }
  };
};

exports.deleteAccount = functions.https.onCall(
    createDeleteAccountHandler({
      db,
      admin,
    }),
);
exports.createDeleteAccountHandler = createDeleteAccountHandler;
