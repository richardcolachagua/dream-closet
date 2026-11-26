const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const runtime = require('../../functions/search/services/providerExecution');
const {runProvider, requireProductArray} = runtime;
const {buildSearchQuery} = require('../../functions/search/utils/buildSearchQuery');
const {mapSortForAsos, mapSortForRealtime} =
  require('../../functions/search/utils/sortMappings');

const run = (search, extra = {}) => runProvider({
  name: 'test', search, normalize: (items) => items,
  request: {}, deadlineAt: Date.now() + 1000, ...extra,
});
const load = (file, dependencies, extra = {}) => {
  const module = {exports: {}};
  const filename = path.resolve(__dirname, '../../functions/search', file);
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
    module, console: {error() {}, info() {}},
    require(id) {
      if (!(id in dependencies)) throw new Error(`Unexpected dependency: ${id}`);
      return dependencies[id];
    },
    ...extra,
  }, {filename});
  return module.exports;
};

test('valid empty arrays remain successful', async () => {
  const result = await run(async () => []);
  assert.equal(result.status, 'fulfilled');
  assert.equal(result.health.outcome, 'empty');
});
test('malformed lists are not empty successes', async () => {
  for (const value of [undefined, null, {}, 'products']) {
    assert.throws(() => requireProductArray(value));
    const result = await run(async () => value);
    assert.equal(result.health.outcome, 'malformed_response');
  }
});
test('synchronous adapter errors are contained', async () => {
  const result = await run(() => { throw new Error('private'); });
  assert.equal(result.status, 'rejected');
  assert.equal(result.health.outcome, 'upstream_error');
});
test('partially usable records survive with counts', async () => {
  const result = await run(async () => [null, {id: 'a'}], {
    normalize: (items) => items.filter(Boolean),
  });
  assert.equal(result.value.length, 1);
  assert.equal(result.health.receivedCount, 2);
  assert.equal(result.health.rejectedCount, 1);
});
test('nonempty responses with no usable records fail', async () => {
  const result = await run(async () => [null], {normalize: () => []});
  assert.equal(result.health.outcome, 'unusable_records');
});
test('normalizer failures are contained', async () => {
  const result = await run(async () => [1], {
    normalize: () => { throw new Error('private payload'); },
  });
  assert.equal(result.status, 'rejected');
  assert.ok(!JSON.stringify(result).includes('private payload'));
});
test('deadline bounds waiting and signals cancellation', async () => {
  let signal;
  const result = await run(({signal: value}) => {
    signal = value;
    return new Promise(() => {});
  }, {deadlineAt: Date.now() + 20});
  assert.equal(result.health.outcome, 'timeout');
  assert.equal(signal.aborted, true);
});
test('expired budget does not call provider', async () => {
  let called = false;
  const result = await run(() => { called = true; return []; },
      {deadlineAt: Date.now() - 1});
  assert.equal(called, false);
  assert.equal(result.health.outcome, 'timeout');
});
test('late rejections remain handled after timeout', async () => {
  let rejectProvider;
  const result = await run(() => new Promise((resolve, reject) => {
    rejectProvider = reject;
  }), {deadlineAt: Date.now() + 20});
  assert.equal(result.status, 'rejected');
  rejectProvider(new Error('late failure'));
  await new Promise((resolve) => setImmediate(resolve));
});
test('health contains only allowlisted values', async () => {
  const error = Object.assign(new Error('SECRET'), {
    response: {status: 429, data: {secret: 'SECRET'}},
    config: {headers: {key: 'SECRET'}},
  });
  const result = await run(async () => { throw error; });
  assert.equal(result.health.httpStatus, 429);
  assert.ok(!JSON.stringify(result).includes('SECRET'));
  assert.deepEqual(Object.keys(result.health).sort(), [
    'durationMs', 'httpStatus', 'normalizedCount', 'outcome', 'provider',
    'receivedCount', 'rejectedCount',
  ]);
});
test('runner clears timer after successful completion', async () => {
  let cleared = false;
  const custom = load('services/providerExecution.js', {}, {
    AbortController,
    setTimeout: () => 123,
    clearTimeout: (timer) => { cleared = timer === 123; },
  });
  await custom.runProvider({name: 'test', search: async () => [],
    normalize: (items) => items, request: {}, deadlineAt: Date.now() + 1000});
  assert.equal(cleared, true);
});
test('credentials are trimmed and missing values fail safely', () => {
  for (const value of [undefined, '', '  ', 'bad key', ' secret ']) {
    const {getRapidApiKey} = load('utils/rapidApi.js', {}, {
      process: {env: {RAPIDAPI_KEY: value}},
    });
    if (value === ' secret ') {
      assert.equal(getRapidApiKey(), 'secret');
    } else {
      assert.throws(getRapidApiKey, (error) =>
        error.code === 'PROVIDER_CONFIGURATION' && !error.message.includes('bad key'));
    }
  }
});
test('query hints do not duplicate or contradict explicit wording', () => {
  assert.equal(buildSearchQuery('women linen shirt', 'female'), 'women linen shirt');
  assert.equal(buildSearchQuery("Women's linen shirt", 'male'), "Women's linen shirt");
  assert.equal(buildSearchQuery('  linen   shirt ', 'female'), 'women linen shirt');
  assert.equal(buildSearchQuery('unisex hoodie', 'male'), 'unisex hoodie');
  assert.equal(buildSearchQuery('human print shirt', 'male'), 'men human print shirt');
});
test('ASOS relevance requests default ordering, not freshness', () => {
  assert.equal(mapSortForAsos('relevance'), undefined);
  assert.equal(mapSortForAsos('newest'), 'freshness');
  assert.equal(mapSortForRealtime('relevance'), 'BEST_MATCH');
});

for (const provider of ['asos', 'realtime']) {
  test(`${provider} adapter validates envelopes and passes signal/timeout`, async () => {
    let config;
    let response = provider === 'asos' ? {data: {products: []}} :
      {data: {data: {products: []}}};
    const deps = {
      axios: {request: async (value) => { config = value; return response; }},
      '../utils/rapidApi': {getRapidApiKey: () => 'test-key'},
      '../utils/buildSearchQuery': {buildSearchQuery: (query) => query},
      '../utils/sortMappings': {mapSortForAsos, mapSortForRealtime},
      '../services/providerExecution': runtime,
    };
    const module = load(provider === 'asos' ? 'providers/asosProvider.js' :
      'providers/realTimeProductProvider.js', deps);
    const search = module.searchAsos || module.searchRealTimeProducts;
    const signal = new AbortController().signal;
    assert.equal((await search({query: 'shirt', signal})).length, 0);
    assert.equal(config.signal, signal);
    assert.equal(config.timeout, 9000);
    assert.equal(config.headers['x-rapidapi-key'], 'test-key');
    if (provider === 'asos') assert.equal('sort' in config.params, false);
    response = {data: {}};
    await assert.rejects(search({query: 'shirt'}), (error) =>
      error.code === 'PROVIDER_RESPONSE_INVALID');
  });
}

test('aggregation preserves partial success and emits sanitized health', async () => {
  const messages = [];
  const deps = {
    '../providers/asosProvider': {searchAsos: async () => {
      throw new Error('SECRET');
    }},
    '../providers/realTimeProductProvider': {
      searchRealTimeProducts: async () => [{id: 'ok'}],
    },
    '../normalization/normalizeProducts': {
      normalizeCombinedResults: (a, b) => [...a, ...b],
    },
    '../filtering/applyProductFilters': {applyProductFilters: (items) => items},
    '../filtering/dedupeProducts': {dedupeProducts: (items) => items},
    '../filtering/sortProducts': {sortProducts: (items) => items},
    './providerExecution': runtime,
  };
  const {performSearch} = load('services/performSearch.js', deps, {
    console: {error: (...args) => messages.push(args), info() {}},
  });
  const result = await performSearch({query: 'shirt'});
  assert.equal(result.results.length, 1);
  assert.equal(result.warnings.length, 1);
  assert.equal(result.ordering.asos, 'provider-default-unverified');
  assert.ok(!JSON.stringify(messages).includes('SECRET'));
});
