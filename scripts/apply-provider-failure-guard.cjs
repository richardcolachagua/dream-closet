const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const target = path.resolve("functions/search/services/performSearch.js");
const expected = "fae91581af27486e01565a02b9456e89d9069ba9";
const original = fs.readFileSync(target, "utf8");
const marker = "  const normalizedResults = normalizeCombinedResults(";
const insertion = `  if (providerCalls.every((call) => call.status === 'rejected')) {
    const error = new Error('All search providers are temporarily unavailable.');
    error.code = 'SEARCH_ALL_PROVIDERS_FAILED';
    throw error;
  }

`;
if (!original.includes("error.code = 'SEARCH_ALL_PROVIDERS_FAILED'")) {
  const actual = execFileSync("git", ["hash-object", target], {
    encoding: "utf8",
  }).trim();
  if (actual !== expected)
    throw new Error("Source differs from reviewed version. No files changed.");
  if (original.split(marker).length !== 2)
    throw new Error("Patch anchor is not unique.");
  fs.writeFileSync(target, original.replace(marker, insertion + marker));
}
console.log("Provider-failure guard is present. Run the supplied tests next.");
