const test = require("node:test");
const assert = require("node:assert/strict");

const {
  QUOTA_TIME_ZONE,
  VISITOR_WINDOW_MS,
  calendarDayKey,
  nextCalendarReset,
  evaluateVisitorQuota,
  evaluateFreeQuota,
  evaluateProQuota,
} = require("../../functions/search/quota/quotaPolicy");

const timestamp = (value) => Date.parse(value);

test("Free quota uses the New York calendar date", () => {
  assert.equal(QUOTA_TIME_ZONE, "America/New_York");

  assert.equal(
    calendarDayKey(timestamp("2026-11-20T04:59:59.999Z")),
    "2026-11-19",
  );

  assert.equal(
    calendarDayKey(timestamp("2026-11-20T05:00:00.000Z")),
    "2026-11-20",
  );
});

test("Free quota resets at the next midnight, not 24 hours from now", () => {
  const nowMs = timestamp("2026-11-19T23:00:00.000Z");

  assert.equal(
    new Date(nextCalendarReset(nowMs)).toISOString(),
    "2026-11-20T05:00:00.000Z",
  );
});

test("Free reset supports the spring daylight-saving boundary", () => {
  const start = timestamp("2026-03-08T05:00:00.000Z");
  const reset = nextCalendarReset(start);

  assert.equal(new Date(reset).toISOString(), "2026-03-09T04:00:00.000Z");

  assert.equal(reset - start, 23 * 60 * 60 * 1000);
});

test("Free reset supports the autumn daylight-saving boundary", () => {
  const start = timestamp("2026-11-01T04:00:00.000Z");
  const reset = nextCalendarReset(start);

  assert.equal(new Date(reset).toISOString(), "2026-11-02T05:00:00.000Z");

  assert.equal(reset - start, 25 * 60 * 60 * 1000);
});

test("Free quota blocks a sixth new search in the same day", () => {
  const { quota } = evaluateFreeQuota({
    nowMs: timestamp("2026-11-19T18:00:00.000Z"),
    storedDayKey: "2026-11-19",
    storedUsed: 5,
  });

  assert.equal(quota.used, 5);
  assert.equal(quota.remaining, 0);
  assert.equal(quota.canSearch, false);
});

test("Free quota renews when the New York date changes", () => {
  const { dayKey, quota } = evaluateFreeQuota({
    nowMs: timestamp("2026-11-20T05:00:00.000Z"),
    storedDayKey: "2026-11-19",
    storedUsed: 5,
  });

  assert.equal(dayKey, "2026-11-20");
  assert.equal(quota.used, 0);
  assert.equal(quota.remaining, 5);
  assert.equal(quota.canSearch, true);
});

test("Free reset remains stable for repeated checks during the same day", () => {
  const first = evaluateFreeQuota({
    nowMs: timestamp("2026-11-19T15:00:00.000Z"),
  });

  const second = evaluateFreeQuota({
    nowMs: timestamp("2026-11-19T20:00:00.000Z"),
  });

  assert.equal(first.quota.resetAt, second.quota.resetAt);
});

test("visitor reservations expire individually after exactly 24 hours", () => {
  const reservations = [
    timestamp("2026-11-16T15:00:00.000Z"),
    timestamp("2026-11-16T19:00:00.000Z"),
    timestamp("2026-11-17T01:00:00.000Z"),
  ];

  const before = evaluateVisitorQuota({
    nowMs: timestamp("2026-11-17T14:59:59.999Z"),
    reservations,
  });

  assert.equal(before.quota.remaining, 0);
  assert.equal(before.quota.canSearch, false);
  assert.equal(before.quota.resetAt, "2026-11-17T15:00:00.000Z");

  const atExpiration = evaluateVisitorQuota({
    nowMs: timestamp("2026-11-17T15:00:00.000Z"),
    reservations,
  });

  assert.equal(atExpiration.activeReservations.length, 2);
  assert.equal(atExpiration.quota.remaining, 1);
  assert.equal(atExpiration.quota.resetAt, "2026-11-17T19:00:00.000Z");
});

test("a newly used visitor slot has its own expiration", () => {
  const { quota } = evaluateVisitorQuota({
    nowMs: timestamp("2026-11-17T15:05:00.000Z"),
    reservations: [
      timestamp("2026-11-16T19:00:00.000Z"),
      timestamp("2026-11-17T01:00:00.000Z"),
      timestamp("2026-11-17T15:05:00.000Z"),
    ],
  });

  assert.equal(quota.remaining, 0);
  assert.equal(quota.resetAt, "2026-11-17T19:00:00.000Z");
});

test("an unused visitor quota has no artificial reset time", () => {
  const { quota } = evaluateVisitorQuota({
    nowMs: timestamp("2026-11-19T18:00:00.000Z"),
  });

  assert.equal(quota.remaining, 3);
  assert.equal(quota.resetAt, null);
  assert.equal(quota.canSearch, true);
});

test("simultaneous visitor reservations each count", () => {
  const nowMs = timestamp("2026-11-19T18:00:00.000Z");

  const { quota } = evaluateVisitorQuota({
    nowMs,
    reservations: [nowMs, nowMs, nowMs],
  });

  assert.equal(quota.used, 3);
  assert.equal(quota.remaining, 0);
});

test("Pro has no daily quota", () => {
  const quota = evaluateProQuota();

  assert.equal(quota.tier, "pro");
  assert.equal(quota.unlimited, true);
  assert.equal(quota.limit, null);
  assert.equal(quota.used, null);
  assert.equal(quota.remaining, null);
  assert.equal(quota.resetAt, null);
  assert.equal(quota.canSearch, true);
});

test("malformed server usage fails rather than granting fresh quota", () => {
  const nowMs = timestamp("2026-11-19T18:00:00.000Z");

  assert.throws(() =>
    evaluateVisitorQuota({
      nowMs,
      reservations: null,
    }),
  );

  assert.throws(() =>
    evaluateVisitorQuota({
      nowMs,
      reservations: [nowMs + 1],
    }),
  );

  assert.throws(() =>
    evaluateFreeQuota({
      nowMs,
      storedUsed: "5",
    }),
  );

  assert.throws(() =>
    evaluateFreeQuota({
      nowMs,
      storedDayKey: "2026-11-20",
      storedUsed: 0,
    }),
  );
});

test("visitor expiration is an exact duration", () => {
  assert.equal(VISITOR_WINDOW_MS, 86400000);
});
