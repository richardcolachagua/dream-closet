const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const operations = [{"path": "functions/search/services/performSearch.js", "sha": "445741fabf0b24246e1e143b2052e4b688532256", "changes": [["  const startIndex = Math.max(0, (Number(page) - 1) * Number(pageSize));\n  const endIndex = startIndex + Number(pageSize);", "  // A page is one upstream window per provider, not a combined slice.\n  const hasMore = Number(page) < 1000 && providerCalls.some((call) =>\n    call.status === 'fulfilled' && call.value.length >= Number(pageSize),\n  );"], ["results: sortedResults.slice(startIndex, endIndex),", "results: sortedResults,"], ["    total: sortedResults.length,", "    total: sortedResults.length,\n    totalScope: 'provider-window',\n    paginationMode: 'provider-window-v1',"], ["    hasMore: endIndex < sortedResults.length,", "    hasMore,"]]}, {"path": "src/features/search/components/CallableSearchWorkspace.jsx", "sha": "82cec51aada58f44763c53e194e3c7c67c68011b", "changes": [["                  total={response?.total || 0}", "                  total={response?.total || 0}\n                  totalScope={response?.totalScope}"]]}, {"path": "src/features/search/components/SearchSortBar.jsx", "sha": "e62a8bafae3b7883cc106b6ee002aba0ad249165", "changes": [["  total = 0,", "  total = 0,\n  totalScope,"], ["{safeVisibleCount} of {safeTotal} result{safeTotal === 1 ? \"\" : \"s\"}", "{totalScope === \"provider-window\"\n            ? `${safeVisibleCount} result${safeVisibleCount === 1 ? \"\" : \"s\"} loaded`\n            : `${safeVisibleCount} of ${safeTotal} result${safeTotal === 1 ? \"\" : \"s\"}`}"]]}];
const pending = operations.map(({path, sha, changes}) => {
  const before = fs.readFileSync(path, 'utf8');
  const actual = execFileSync('git', ['hash-object', path], {encoding: 'utf8'}).trim();
  if (actual !== sha) throw new Error(`Unexpected source: ${path}. No files changed.`);
  let after = before;
  for (const [from, to] of changes) {
    if (after.split(from).length !== 2) throw new Error(`Nonunique anchor: ${path}`);
    after = after.replace(from, to);
  }
  return {path, after};
});
for (const {path, after} of pending) fs.writeFileSync(path, after);
console.log('Applied provider-window pagination and loaded-count presentation.');
