const {HttpsError} = require('firebase-functions/v1/https');
const {FieldValue} = require('firebase-admin/firestore');
const MAX_ENTITLEMENT_AGE_MS = 15 * 60 * 1000;

const subscriptionPeriodEnd = (subscription) => {
  const periods = subscription?.items?.data?.map((item) => item.current_period_end)
      .filter(Number.isSafeInteger) || [];
  if (Number.isSafeInteger(subscription?.current_period_end)) {
    return subscription.current_period_end;
  }
  return periods.length ? Math.min(...periods) : null;
};
const createEntitlementRefresh = ({db, clock = Date.now,
  enabled = () => process.env.SEARCH_REFRESH_ENTITLEMENTS === 'true',
  stripeFactory = () => require('stripe')(process.env.STRIPE_SECRET_KEY,
      {timeout: 8000, maxNetworkRetries: 0})}) => {
  const pending = new Map();
  const refresh = async ({uid, kind}) => {
    if (!enabled() || kind !== 'registered') return;
    if (pending.has(uid)) return pending.get(uid);
    const task = (async () => {
      const ref = db.collection('users').doc(uid);
      const snapshot = await ref.get();
      const sub = snapshot.data()?.subscription;
      if (!sub?.stripeSubscriptionId) return;
      const now = clock();
      const verified = sub.searchEntitlementVerifiedAtMs;
      const updated = sub.updatedAt?.toMillis?.() || 0;
      const verifiedRecord = sub.searchEntitlementRecordAt?.toMillis?.() || 0;
      if (Number.isSafeInteger(verified) && verified <= now && verifiedRecord >= updated &&
          now - verified < MAX_ENTITLEMENT_AGE_MS &&
          (sub.status !== 'active' || sub.searchEntitlementExpiresAtMs > now)) return;
      try {
        const stripe = stripeFactory();
        const current = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
        if (current.id !== sub.stripeSubscriptionId) throw new Error('Subscription mismatch.');
        const periodEnd = subscriptionPeriodEnd(current);
        if (current.status === 'active' && !periodEnd) throw new Error('Missing subscription period.');
        const price = current.items?.data?.[0]?.price;
        await db.runTransaction(async (tx) => {
          const deletion = await tx.get(db.collection('accountDeletions').doc(uid));
          const latest = await tx.get(ref);
          if (deletion.exists || !latest.exists) return;
          if (latest.data().subscription?.stripeSubscriptionId !== current.id) {
            throw new Error('Subscription changed during refresh.');
          }
          if ((latest.data().subscription?.updatedAt?.toMillis?.() || 0) !== updated) {
            throw new Error('Subscription changed during refresh. Retry verification.');
          }
          if ((latest.data().subscription?.searchEntitlementVerifiedAtMs || 0) > now) return;
          tx.update(ref, {
            'subscription.status': current.status,
            'subscription.priceId': price?.id || null,
            'subscription.currentPeriodEnd': periodEnd,
            'subscription.searchEntitlementVerifiedAtMs': now,
            'subscription.searchEntitlementRecordAt': FieldValue.serverTimestamp(),
            'subscription.searchEntitlementExpiresAtMs': periodEnd ? periodEnd * 1000 : null,
            'subscription.updatedAt': FieldValue.serverTimestamp(),
          });
        });
      } catch (error) {
        throw new HttpsError('unavailable',
            'Subscription verification is temporarily unavailable. Try again later.',
            {reason: 'SEARCH_ENTITLEMENT_UNAVAILABLE'});
      }
    })().finally(() => pending.delete(uid));
    pending.set(uid, task);
    return task;
  };
  return {refresh};
};
module.exports = {createEntitlementRefresh, MAX_ENTITLEMENT_AGE_MS, subscriptionPeriodEnd};
