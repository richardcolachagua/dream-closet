const fs = require('node:fs');
const {execFileSync} = require('node:child_process');
const evidence = JSON.parse(fs.readFileSync('phase6-release-evidence.json', 'utf8'));
const stage = process.argv.includes('--release') ? 'release' : 'enforce';
const head = execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim();
const required = ['automated', 'callable-auth-errors', 'visitor-free-pro',
  'account-transitions', 'multi-tab-concurrency', 'pagination-provider-failures',
  'recovery-deletion', 'entitlement-refresh', 'cleanup-index-scheduler', 'appcheck-monitor'];
if (stage === 'release') required.push('appcheck-enforced-valid-invalid', 'rollback-reviewed');
const failed = required.filter((name) => {
  const item = evidence.gates[name];
  return !item || item.status !== 'pass' || item.commit !== head ||
    typeof item.evidence !== 'string' || item.evidence.trim().length < 10;
});
if (!evidence.stagingProject || evidence.stagingProject === 'REQUIRED' ||
    evidence.stagingProject === 'dream-closet-4d254') failed.push('isolated-staging-project');
if (failed.length) {
  console.error(`Phase 6 ${stage} gate BLOCKED: ${failed.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log(`Evidence recorded for ${stage} gate at ${head}. No deployment performed.`);
}
