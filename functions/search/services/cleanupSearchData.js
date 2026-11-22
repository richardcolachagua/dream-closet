const functions = require('firebase-functions/v1');
const {db} = require('../../config/firebase');
const {createSearchDataLifecycle} = require('./searchDataLifecycle');

exports.cleanupSearchData = functions
    .runWith({timeoutSeconds: 540, memory: '512MB'})
    .pubsub.schedule('every 60 minutes')
    .onRun(async () => {
      const summary = await createSearchDataLifecycle({db}).sweepExpired();
      console.log('Search data cleanup:', summary);
      return null;
    });
