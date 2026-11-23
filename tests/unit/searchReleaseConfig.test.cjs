const test = require('node:test');
const assert = require('node:assert/strict');
const {searchAppCheckEnforced} = require('../../functions/search/utils/searchReleaseConfig');
test('App Check enforcement remains off until explicitly enabled', () => {
  assert.equal(searchAppCheckEnforced({}), false);
  assert.equal(searchAppCheckEnforced({SEARCH_ENFORCE_APP_CHECK: 'true'}), true);
});
test('local emulator bypass is explicit', () => {
  assert.equal(searchAppCheckEnforced({SEARCH_ENFORCE_APP_CHECK: 'true', FUNCTIONS_EMULATOR: 'true'}), false);
});
test('typoed enforcement flag fails startup', () => {
  assert.throws(() => searchAppCheckEnforced({SEARCH_ENFORCE_APP_CHECK: 'yes'}));
});
