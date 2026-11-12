const { readFileSync } = require("node:fs");
const path = require("node:path");
const { test, before, beforeEach, after } = require("node:test");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} = require("firebase/firestore");
let env;
const database = (uid = "alice", provider = "password") =>
  env
    .authenticatedContext(uid, {
      email: `${uid}@example.com`,
      firebase: { sign_in_provider: provider, identities: {} },
    })
    .firestore();
const item = () => ({
  name: "Test jacket",
  imageUrl: "https://example.com/image.jpg",
  price: "$20",
  numericPrice: 20,
  productUrl: "https://example.com/product",
  brand: "Test",
  source: "ASOS",
  description: "A jacket",
  createdAt: serverTimestamp(),
});
const filters = () => ({
  gender: [],
  category: [],
  size: [],
  color: [],
  brand: [],
  store: [],
  availability: [],
  priceMin: null,
  priceMax: null,
});
const search = () => ({
  query: "blue jacket",
  filters: filters(),
  sort: "relevance",
  page: 1,
  createdAt: serverTimestamp(),
});
before(async () => {
  env = await initializeTestEnvironment({
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
  await env.clearFirestore();
});
after(async () => {
  if (env) await env.cleanup();
});

for (const [name, build] of [
  ["savedItems", item],
  ["savedSearches", search],
]) {
  test(`${name}: owner can create, read, list, update and delete`, async () => {
    const db = database();
    const reference = doc(db, "users", "alice", name, "one");
    await assertSucceeds(setDoc(reference, build()));
    await assertSucceeds(getDoc(reference));
    await assertSucceeds(getDocs(collection(db, "users", "alice", name)));
    await assertSucceeds(
      updateDoc(
        reference,
        name === "savedItems"
          ? { name: "Updated jacket" }
          : { query: "red jacket" },
      ),
    );
    await assertSucceeds(deleteDoc(reference));
  });
  test(`${name}: cross-user, anonymous and unauthenticated access is denied`, async () => {
    await env.withSecurityRulesDisabled((context) =>
      setDoc(doc(context.firestore(), "users", "alice", name, "one"), build()),
    );
    for (const db of [
      database("bob"),
      database("alice", "anonymous"),
      env.unauthenticatedContext().firestore(),
    ]) {
      const reference = doc(db, "users", "alice", name, "one");
      await assertFails(getDoc(reference));
      await assertFails(getDocs(collection(db, "users", "alice", name)));
      await assertFails(
        setDoc(doc(db, "users", "alice", name, "two"), build()),
      );
      await assertFails(
        updateDoc(
          reference,
          name === "savedItems" ? { name: "Changed" } : { query: "Changed" },
        ),
      );
      await assertFails(deleteDoc(reference));
    }
  });
  test(`${name}: creation requires a fresh server timestamp and updates preserve it`, async () => {
    const reference = doc(database(), "users", "alice", name, "one");
    await assertFails(
      setDoc(reference, { ...build(), createdAt: Timestamp.fromMillis(0) }),
    );
    await assertFails(
      setDoc(reference, { ...build(), createdAt: "2026-01-01" }),
    );
    await assertSucceeds(setDoc(reference, build()));
    await assertFails(
      updateDoc(reference, { createdAt: Timestamp.fromMillis(0) }),
    );
  });
}
test("saved items reject extra fields, invalid URLs, prices and lengths", async () => {
  const reference = doc(database(), "users", "alice", "savedItems", "one");
  const variants = [
    { userId: "alice" },
    { itemId: "123" },
    { admin: true },
    { name: " " },
    { name: "x".repeat(301) },
    { productUrl: "javascript:alert(1)" },
    { imageUrl: "data:image/png;base64,invalid" },
    { numericPrice: -1 },
    { numericPrice: NaN },
    { numericPrice: Infinity },
    { numericPrice: "20" },
    { description: "x".repeat(4001) },
  ];
  for (const change of variants)
    await assertFails(setDoc(reference, { ...item(), ...change }));
  await assertSucceeds(
    setDoc(reference, { ...item(), numericPrice: 0, imageUrl: "" }),
  );
});
test("saved searches reject malformed fields", async () => {
  const reference = doc(database(), "users", "alice", "savedSearches", "one");
  const variants = [
    { query: " " },
    { query: "x".repeat(501) },
    { sort: "unknown" },
    { page: 0 },
    { page: 1.5 },
    { page: 1001 },
    { userId: "alice" },
    { filters: { ...filters(), unexpected: [] } },
    { filters: { ...filters(), gender: ["other"] } },
    { filters: { ...filters(), brand: [42] } },
    { filters: { ...filters(), color: ["blue", "blue"] } },
    { filters: { ...filters(), priceMin: "10" } },
    { filters: { ...filters(), priceMin: -1 } },
    { filters: { ...filters(), priceMin: 100, priceMax: 20 } },
    { filters: { ...filters(), priceMax: Infinity } },
  ];
  for (const change of variants)
    await assertFails(setDoc(reference, { ...search(), ...change }));
  await assertSucceeds(
    setDoc(reference, {
      ...search(),
      filters: { ...filters(), priceMin: 0, priceMax: 100 },
    }),
  );
});
test("onboarding rejects non-string, unknown and mismatched brands", async () => {
  await env.withSecurityRulesDisabled((context) =>
    setDoc(doc(context.firestore(), "users", "alice"), {
      firstName: "Alice",
      lastName: "Example",
      email: "alice@example.com",
      onboarding: {
        gender: null,
        categories: [],
        brands: [],
        completed: false,
      },
      preferences: { emailNotifications: false },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }),
  );
  const reference = doc(database(), "users", "alice");
  for (const brands of [
    [42],
    ["Not a real catalog brand"],
    ["Amiri"],
    ["Nike", "Nike"],
  ]) {
    await assertFails(
      updateDoc(reference, {
        onboarding: {
          gender: "female",
          categories: ["Dresses"],
          brands,
          completed: true,
        },
        updatedAt: serverTimestamp(),
      }),
    );
  }
  await assertSucceeds(
    updateDoc(reference, {
      onboarding: {
        gender: "female",
        categories: ["Dresses"],
        brands: ["Nike"],
        completed: true,
      },
      updatedAt: serverTimestamp(),
    }),
  );
});
