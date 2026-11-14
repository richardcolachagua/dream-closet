const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const catalog = require("../src/shared/data/profileCatalog.json");
const template =
  'rules_version = \'2\';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    function isOwner(uid) {\n      return request.auth != null\n        && request.auth.uid == uid\n        && request.auth.token.firebase.sign_in_provider != "anonymous";\n    }\n    function exactKeys(data, keys) {\n      return data is map && data.keys().hasAll(keys) && data.keys().hasOnly(keys);\n    }\n    function text(value, maximum) {\n      return value is string && value.size() <= maximum;\n    }\n    function selection(value, allowed, maximum) {\n      return value is list && value.size() <= maximum\n        && value.toSet().size() == value.size() && value.hasOnly(allowed);\n    }\n    function categories(gender) {\n      return gender == "female" ? __FEMALE__ : __MALE__;\n    }\n    function brands(gender) {\n      return gender == "female" ? __FBRANDS__ : __MBRANDS__;\n    }\n    function onboarding(data) {\n      return exactKeys(data, ["gender", "categories", "brands", "completed"])\n        && data.gender in [null, "female", "male"]\n        && data.completed is bool\n        && (\n          (data.gender == null && data.categories == [] && data.brands == []\n            && data.completed == false)\n          || (data.gender != null\n            && selection(data.categories, categories(data.gender), 60)\n            && selection(data.brands, brands(data.gender), 100)\n            && (!data.completed || data.categories.size() > 0))\n        );\n    }\n    function preferences(data) {\n      return exactKeys(data, ["emailNotifications"])\n        && data.emailNotifications is bool;\n    }\n    function profile(data) {\n      return data.keys().hasAll(["firstName", "lastName", "email", "onboarding",\n          "preferences", "createdAt", "updatedAt"])\n        && text(data.firstName, 60) && text(data.lastName, 60)\n        && text(data.email, 320) && data.email.size() > 0\n        && onboarding(data.onboarding) && preferences(data.preferences)\n        && data.createdAt is timestamp && data.updatedAt is timestamp;\n    }\n    function price(value) {\n      return value == null || (value is number && value >= 0 && value <= 1000000);\n    }\n    function url(value, optional) {\n      return text(value, 4096)\n        && ((optional && value == "") || value.matches(\'https?://[^\\\\s]+\'));\n    }\n    function savedItem(data) {\n      return data.keys().hasAll(["name", "imageUrl", "price", "productUrl",\n          "brand", "source", "description", "createdAt"])\n        && data.keys().hasOnly(["name", "imageUrl", "price", "numericPrice",\n          "productUrl", "brand", "source", "description", "createdAt"])\n        && text(data.name, 300) && data.name.matches(\'.*[^\\\\s].*\')\n        && url(data.imageUrl, true) && url(data.productUrl, false)\n        && text(data.price, 100) && text(data.brand, 100)\n        && text(data.source, 100) && data.source.size() > 0\n        && text(data.description, 4000)\n        && price(data.get("numericPrice", null))\n        && data.createdAt is timestamp;\n    }\n    function filters(data) {\n      return exactKeys(data, ["gender", "category", "size", "color", "brand",\n          "store", "availability", "priceMin", "priceMax"])\n__FILTER_VALIDATION__\n        && price(data.priceMin) && price(data.priceMax)\n        && (data.priceMin == null || data.priceMax == null\n          || data.priceMin <= data.priceMax);\n    }\n    function savedSearch(data) {\n      return exactKeys(data, ["query", "filters", "sort", "page", "createdAt"])\n        && text(data.query, 500) && data.query.matches(\'.*[^\\\\s].*\')\n        && filters(data.filters) && data.sort in __SORTS__\n        && data.page is int && data.page >= 1 && data.page <= 1000\n        && data.createdAt is timestamp;\n    }\n    match /users/{uid} {\n      allow get: if isOwner(uid);\n      allow list, delete: if false;\n      allow create: if isOwner(uid)\n        && request.resource.data.keys().hasOnly(["firstName", "lastName", "email",\n          "onboarding", "preferences", "createdAt", "updatedAt"])\n        && profile(request.resource.data)\n        && request.resource.data.email == request.auth.token.email\n        && request.resource.data.createdAt == request.time\n        && request.resource.data.updatedAt == request.time;\n      allow update: if isOwner(uid)\n        && request.resource.data.diff(resource.data).affectedKeys().hasOnly([\n          "firstName", "lastName", "onboarding", "preferences", "updatedAt"])\n        && profile(request.resource.data)\n        && request.resource.data.createdAt == resource.data.createdAt\n        && request.resource.data.email == resource.data.email\n        && request.resource.data.updatedAt == request.time;\n      match /savedItems/{id} {\n        allow read, delete: if isOwner(uid);\n        allow create: if isOwner(uid) && savedItem(request.resource.data)\n          && request.resource.data.createdAt == request.time;\n        allow update: if isOwner(uid) && savedItem(request.resource.data)\n          && request.resource.data.createdAt == resource.data.createdAt;\n      }\n      match /savedSearches/{id} {\n        allow read, delete: if isOwner(uid);\n        allow create: if isOwner(uid) && savedSearch(request.resource.data)\n          && request.resource.data.createdAt == request.time;\n        allow update: if isOwner(uid) && savedSearch(request.resource.data)\n          && request.resource.data.createdAt == resource.data.createdAt;\n      }\n    }\n  }\n}\n';
const brands = (gender) => [
  ...new Set(
    catalog.brandGroups.flatMap((group) => [...group.shared, ...group[gender]]),
  ),
];
const values = {
  __FEMALE__: catalog.categories.female,
  __MALE__: catalog.categories.male,
  __FBRANDS__: brands("female"),
  __MBRANDS__: brands("male"),
  __SORTS__: catalog.sorts,
};
let rules = template;
for (const [key, value] of Object.entries(values)) {
  rules = rules.replace(key, JSON.stringify(value));
}
rules = rules.replace(
  "__FILTER_VALIDATION__",
  Object.entries(catalog.filters)
    .map(
      ([key, value]) =>
        `        && selection(data.${key}, ${JSON.stringify(value)}, ${value.length})`,
    )
    .join("\n"),
);
rules = rules.trim() + "\n";
const target = path.join(root, "firestore.rules");
if (process.argv.includes("--check")) {
  if (fs.readFileSync(target, "utf8") !== rules) {
    throw new Error("firestore.rules is stale. Run npm run rules:generate.");
  }
} else {
  fs.writeFileSync(target, rules);
}
