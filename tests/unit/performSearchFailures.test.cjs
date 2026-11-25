const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const runtime = require("../../functions/search/services/providerExecution");
const sourcePath = path.resolve(
  __dirname,
  "../../functions/search/services/performSearch.js",
);
const fixture = ({
  asos = [],
  realtime = [],
  filter = (items) => items,
} = {}) => {
  const calls = { errors: [], normalize: 0 };
  const provider = (value) => async () => {
    if (value instanceof Error) throw value;
    return value;
  };
  const dependencies = {
    "./providerExecution": runtime,
    "../providers/asosProvider": { searchAsos: provider(asos) },
    "../providers/realTimeProductProvider": {
      searchRealTimeProducts: provider(realtime),
    },
    "../normalization/normalizeProducts": {
      normalizeCombinedResults: (a, b) => {
        calls.normalize += 1;
        return [...a, ...b];
      },
    },
    "../filtering/applyProductFilters": { applyProductFilters: filter },
    "../filtering/dedupeProducts": { dedupeProducts: (items) => items },
    "../filtering/sortProducts": { sortProducts: (items) => items },
  };
  const sandbox = {
    module: { exports: {} },
    console: { error: (...args) => calls.errors.push(args) },
    require: (id) => {
      if (!(id in dependencies))
        throw new Error(`Unexpected dependency: ${id}`);
      return dependencies[id];
    },
  };
  vm.runInNewContext(fs.readFileSync(sourcePath, "utf8"), sandbox, {
    filename: sourcePath,
  });
  return { run: sandbox.module.exports.performSearch, calls };
};
const input = { query: "linen shirt" };
test("all providers failing throws rather than returning empty success", async () => {
  const { run, calls } = fixture({
    asos: new Error("private A"),
    realtime: new Error("private B"),
  });
  await assert.rejects(run(input), (error) => {
    assert.equal(error.code, "SEARCH_ALL_PROVIDERS_FAILED");
    assert.ok(!error.message.includes("private"));
    return true;
  });
  assert.equal(calls.normalize, 0);
  assert.equal(calls.errors.length, 2);
});
test("both providers returning empty is a valid empty success", async () => {
  const result = await fixture().run(input);
  assert.equal(result.results.length, 0);
  assert.equal(result.warnings.length, 0);
  assert.equal(result.total, 0);
});
for (const failed of ["asos", "realtime"]) {
  test(`${failed} failure preserves results from the other provider`, async () => {
    const healthy = failed === "asos" ? "realtime" : "asos";
    const result = await fixture({
      [failed]: new Error("offline"),
      [healthy]: [{ id: "available" }],
    }).run(input);
    assert.equal(result.results.length, 1);
    assert.equal(result.results[0].id, "available");
    assert.equal(result.warnings.length, 1);
    assert.equal(result.sources[failed], 0);
    assert.equal(result.sources[healthy], 1);
  });
  test(`${failed} failure with a healthy empty provider remains partial success`, async () => {
    const result = await fixture({ [failed]: new Error("offline") }).run(input);
    assert.equal(result.results.length, 0);
    assert.equal(result.warnings.length, 1);
  });
}
test("successful results filtered to empty are not a provider outage", async () => {
  const result = await fixture({ asos: [{ id: "a" }], filter: () => [] }).run(
    input,
  );
  assert.equal(result.results.length, 0);
  assert.equal(result.warnings.length, 0);
});
test("both successful providers contribute results", async () => {
  const result = await fixture({
    asos: [{ id: "a" }],
    realtime: [{ id: "b" }],
  }).run(input);
  assert.equal(result.results.length, 2);
  assert.equal(result.warnings.length, 0);
});
