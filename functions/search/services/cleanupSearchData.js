const functions = require('firebase-functions/v1');
const {db} = require('../../config/firebase');
const {createSearchMaintenance} = require('./searchMaintenance');

exports.cleanupSearchData = functions
    .runWith({timeoutSeconds: 540, memory: '512MB'})
    .pubsub.schedule('every 60 minutes')
    .onRun(async () => {
      const summary = await createSearchMaintenance({db}).run();
      if (summary.failed || summary.skipped) {
        console.warn('Search maintenance needs review:', summary);
      } else {
        console.log('Search maintenance completed:', summary);
      }
      return null;
    });
