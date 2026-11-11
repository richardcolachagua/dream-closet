const { readFileSync } = require("node:fs");
const path = require("node:path");
const { after, before, beforeEach, test } = require("node:test");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} = require("firebase/firestore");

let environment;

const registeredDb = (uid = "alice") =>
  environment
    .authenticatedContext(uid, {
      email: `${uid}@example.com`,
      firebase: {
        sign_in_provider: "password",
        identities: {},
      },
    })
    .firestore();

const profile = () => ({
  firstName: "Alice",
  lastName: "Example",
  email: "alice@example.com",
  onboarding: {
    gender: null,
    categories: [],
    brands: [],
    completed: false,
  },
  preferences: {
    emailNotifications: false,
  },
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

const seed = async (extra = {}) => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "users", "alice"), {
      ...profile(),
      ...extra,
    });
  });
};

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: "demo-dream-closet-rules",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: readFileSync(
        path.resolve(__dirname, "../../firestore.rules"),
        "utf8",
      ),
    },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
});

after(async () => {
  if (environment) {
    await environment.cleanup();
  }
});

test("registered owner can create a valid profile", async () => {
  await assertSucceeds(
    setDoc(doc(registeredDb(), "users", "alice"), profile()),
  );
});

test("unauthenticated client cannot create a profile", async () => {
  const db = environment.unauthenticatedContext().firestore();

  await assertFails(setDoc(doc(db, "users", "alice"), profile()));
});

test("anonymous account cannot create or read its profile", async () => {
  await seed();

  const db = environment
    .authenticatedContext("alice", {
      firebase: {
        sign_in_provider: "anonymous",
        identities: {},
      },
    })
    .firestore();

  await assertFails(setDoc(doc(db, "users", "alice"), profile()));

  await assertFails(getDoc(doc(db, "users", "alice")));
});

test("another user cannot read or update the profile", async () => {
  await seed();

  const reference = doc(registeredDb("bob"), "users", "alice");

  await assertFails(getDoc(reference));

  await assertFails(
    updateDoc(reference, {
      firstName: "Changed",
      updatedAt: serverTimestamp(),
    }),
  );
});

test("profile creation rejects forged email and billing fields", async () => {
  const reference = doc(registeredDb(), "users", "alice");

  await assertFails(
    setDoc(reference, {
      ...profile(),
      email: "someone-else@example.com",
    }),
  );

  await assertFails(
    setDoc(reference, {
      ...profile(),
      subscription: { status: "active" },
    }),
  );

  await assertFails(
    setDoc(reference, {
      ...profile(),
      admin: true,
    }),
  );
});

test("owner can update allowed fields while preserving server data", async () => {
  await seed({
    subscription: { status: "active" },
    customerId: "server-customer",
  });

  await assertSucceeds(
    updateDoc(doc(registeredDb(), "users", "alice"), {
      firstName: "Updated",
      preferences: {
        emailNotifications: true,
      },
      updatedAt: serverTimestamp(),
    }),
  );
});

test("owner cannot introduce server-owned fields", async () => {
  await seed();

  const reference = doc(registeredDb(), "users", "alice");

  for (const field of [
    "subscription",
    "customerId",
    "stripeCustomerId",
    "entitlements",
    "admin",
    "role",
    "usage",
  ]) {
    await assertFails(
      updateDoc(reference, {
        [field]: { forged: true },
        updatedAt: serverTimestamp(),
      }),
    );
  }
});

test("owner cannot change or remove an existing subscription", async () => {
  await seed({
    subscription: { status: "inactive" },
  });

  const reference = doc(registeredDb(), "users", "alice");

  await assertFails(
    updateDoc(reference, {
      subscription: { status: "active" },
      updatedAt: serverTimestamp(),
    }),
  );

  await assertFails(
    updateDoc(reference, {
      subscription: deleteField(),
      updatedAt: serverTimestamp(),
    }),
  );
});

test("owner cannot change email or createdAt", async () => {
  await seed();

  const reference = doc(registeredDb(), "users", "alice");

  await assertFails(
    updateDoc(reference, {
      email: "changed@example.com",
      updatedAt: serverTimestamp(),
    }),
  );

  await assertFails(
    updateDoc(reference, {
      createdAt: Timestamp.fromMillis(0),
      updatedAt: serverTimestamp(),
    }),
  );
});

test("profile writes require fresh timestamps", async () => {
  const reference = doc(registeredDb(), "users", "alice");

  await assertFails(
    setDoc(reference, {
      ...profile(),
      createdAt: Timestamp.fromMillis(0),
    }),
  );

  await seed();

  await assertFails(
    updateDoc(reference, {
      firstName: "Updated",
      updatedAt: Timestamp.fromMillis(0),
    }),
  );
});

test("malformed onboarding and preference values are rejected", async () => {
  await seed();

  const reference = doc(registeredDb(), "users", "alice");

  for (const onboarding of [
    {
      gender: "unexpected",
      categories: [],
      brands: [],
      completed: false,
    },
    {
      gender: "female",
      categories: ["Not a category"],
      brands: [],
      completed: false,
    },
    {
      gender: "female",
      categories: ["Dresses", "Dresses"],
      brands: [],
      completed: false,
    },
    {
      gender: null,
      categories: [],
      brands: [],
      completed: true,
    },
    {
      gender: "female",
      categories: ["Dresses"],
      brands: Array.from({ length: 101 }, (_, index) => `Brand ${index}`),
      completed: false,
    },
  ]) {
    await assertFails(
      updateDoc(reference, {
        onboarding,
        updatedAt: serverTimestamp(),
      }),
    );
  }

  await assertFails(
    updateDoc(reference, {
      preferences: {
        emailNotifications: "yes",
      },
      updatedAt: serverTimestamp(),
    }),
  );
});

test("completed onboarding may omit favorite brands", async () => {
  await seed();

  await assertSucceeds(
    updateDoc(doc(registeredDb(), "users", "alice"), {
      onboarding: {
        gender: "female",
        categories: ["Dresses"],
        brands: [],
        completed: true,
      },
      updatedAt: serverTimestamp(),
    }),
  );
});

test("direct client profile deletion is denied", async () => {
  await seed();

  await assertFails(deleteDoc(doc(registeredDb(), "users", "alice")));
});

test("future operational and quota collections are denied", async () => {
  const db = registeredDb();

  for (const collection of ["usage", "quotas", "metrics"]) {
    await assertFails(
      setDoc(doc(db, collection, "alice"), {
        count: 0,
      }),
    );
  }
});
