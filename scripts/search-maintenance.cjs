const {createSearchMaintenance} = require('../functions/search/services/searchMaintenance');
const admin = require('../functions/node_modules/firebase-admin');
const arg = (name) => process.argv.find((v) => v.startsWith(`--${name}=`))?.split('=').slice(1).join('=');
const projectId = arg('project');
const apply = process.argv.includes('--apply');
if (!projectId || (apply && arg('confirm-project') !== projectId)) {
  throw new Error('Use --project=ID; writes also require --apply --confirm-project=ID.');
}
if (process.env.FIRESTORE_EMULATOR_HOST && !projectId.startsWith('demo-')) {
  throw new Error('Use a demo project when targeting an emulator.');
}
const app = admin.initializeApp({projectId});
(async () => {
  try {
    const summary = await createSearchMaintenance({db: app.firestore()}).run({dryRun: !apply});
    console.log(JSON.stringify({projectId, ...summary}, null, 2));
    if (summary.failed) process.exitCode = 1;
  } finally {await app.delete();}
})().catch((error) => {console.error(error.message); process.exitCode = 1;});
