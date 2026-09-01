const functions = require('firebase-functions');
const cors = require('../config/cors');
const {validateSearchPayload} = require('./utils/searchValidation');
const {performSearch} = require('./services/performSearch');

const searchProducts = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).json({
        error: 'Method not allowed.',
      });

      return;
    }

    try {
      const payload = validateSearchPayload(req.body?.data || req.body || {});

      const result = await performSearch(payload);

      res.status(200).json({result});
    } catch (error) {
      console.error('Product search failed:', error);

      if (error instanceof functions.https.HttpsError) {
        res.status(400).json({
          error: error.message,
        });

        return;
      }

      res.status(500).json({
        error: error?.message || 'Search failed.',
      });
    }
  });
});

module.exports = {
  searchProducts,
};
