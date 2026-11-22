const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.resolve(__dirname,
  '../../functions/search/services/performSearch.js'), 'utf8');
const items = (prefix, count) => Array.from({length: count},
  (_, i) => ({id: `${prefix}-${i}`}));
function fixture({a = [], b = [], filter = (x) => x} = {}) {
  const calls = [];
  const provider = (value, name) => async (args) => {
    calls.push({name, ...args});
    if (value instanceof Error) throw value;
    return typeof value === 'function' ? value(args) : value;
  };
  const deps = {
    '../providers/asosProvider': {searchAsos: provider(a, 'asos')},
    '../providers/realTimeProductProvider': {searchRealTimeProducts: provider(b, 'realtime')},
    '../normalization/normalizeProducts': {normalizeCombinedResults: (x, y) => [...x, ...y]},
    '../filtering/dedupeProducts': {dedupeProducts: (x) => [...new Map(x.map((v) => [v.id, v])).values()]},
    '../filtering/applyProductFilters': {applyProductFilters: filter},
    '../filtering/sortProducts': {sortProducts: (x) => x},
  };
  const sandbox = {module: {exports: {}}, console: {error() {}}, require(id) {
    if (!(id in deps)) throw new Error(`Unexpected dependency ${id}`);
    return deps[id];
  }};
  vm.runInNewContext(source, sandbox);
  return {run: sandbox.module.exports.performSearch, calls};
}
const request = {query: 'linen', page: 1, pageSize: 24};

test('complete combined window retains all 48 results', async () => {
  const r = await fixture({a: items('a', 24), b: items('b', 24)}).run(request);
  assert.equal(r.results.length, 48);
  assert.equal(r.total, 48);
  assert.equal(r.totalScope, 'provider-window');
  assert.equal(r.paginationMode, 'provider-window-v1');
  assert.equal(r.hasMore, true);
});
test('page two is not sliced a second time', async () => {
  const {run, calls} = fixture({a: items('a', 24), b: items('b', 24)});
  const r = await run({...request, page: 2});
  assert.equal(r.results.length, 48);
  assert.ok(calls.every((c) => c.page === 2 && c.pageSize === 24));
});
test('later pages preserve short windows', async () => {
  const r = await fixture({a: items('a', 3)}).run({...request, page: 9});
  assert.equal(r.results.length, 3);
  assert.equal(r.hasMore, false);
});
test('raw provider fullness keeps continuation despite filtering to empty', async () => {
  const r = await fixture({a: items('a', 24), filter: () => []}).run(request);
  assert.equal(r.results.length, 0);
  assert.equal(r.hasMore, true);
});
test('deduplication does not hide upstream continuation', async () => {
  const r = await fixture({a: Array(24).fill({id: 'same'})}).run(request);
  assert.equal(r.results.length, 1);
  assert.equal(r.hasMore, true);
});
test('both empty providers stop continuation', async () => {
  assert.equal((await fixture().run(request)).hasMore, false);
});
test('partial failure preserves a full healthy window and warning', async () => {
  const r = await fixture({a: new Error('offline'), b: items('b', 24)}).run(request);
  assert.equal(r.results.length, 24);
  assert.equal(r.warnings.length, 1);
  assert.equal(r.hasMore, true);
});
test('total provider failure still throws', async () => {
  await assert.rejects(fixture({a: new Error('a'), b: new Error('b')}).run(request),
    (e) => e.code === 'SEARCH_ALL_PROVIDERS_FAILED');
});
test('page size one does not drop the second provider product', async () => {
  const r = await fixture({a: items('a', 1), b: items('b', 1)}).run({...request, pageSize: 1});
  assert.equal(r.results.length, 2);
});
test('page limit does not offer an invalid next request', async () => {
  const r = await fixture({a: items('a', 24)}).run({...request, page: 1000});
  assert.equal(r.hasMore, false);
});
test('sequential disjoint upstream windows retain every product', async () => {
  const {run} = fixture({a: ({page}) => items(`a${page}`, 24),
    b: ({page}) => items(`b${page}`, 24)});
  const first = await run(request);
  const second = await run({...request, page: 2});
  assert.equal(new Set([...first.results, ...second.results].map((x) => x.id)).size, 96);
});
