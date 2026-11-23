const QUOTA_TIME_ZONE = 'America/New_York';
const VISITOR_WINDOW_MS = 24 * 60 * 60 * 1000;

const LIMITS = Object.freeze({
  visitor: 3,
  free: 5,
  pro: null,
});

const dayFormatter = new Intl.DateTimeFormat('en-US', {
  timeZone: QUOTA_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

const assertTime = (value) => {
  if (
    !Number.isSafeInteger(value) ||
    value < 0 ||
    !Number.isFinite(new Date(value).getTime())
  ) {
    throw new TypeError('Expected a valid millisecond timestamp.');
  }
};

const calendarDayKey = (nowMs) => {
  assertTime(nowMs);

  const parts = dayFormatter.formatToParts(new Date(nowMs));

  const getPart = (type) => parts.find((part) => part.type === type).value;

  return [getPart('year'), getPart('month'), getPart('day')].join('-');
};

const nextCalendarReset = (nowMs) => {
  const currentDay = calendarDayKey(nowMs);

  let lower = nowMs;
  let upper = nowMs + 48 * 60 * 60 * 1000;

  while (upper - lower > 1) {
    const middle = Math.floor((lower + upper) / 2);

    if (calendarDayKey(middle) === currentDay) {
      lower = middle;
    } else {
      upper = middle;
    }
  }

  return upper;
};

const buildStatus = ({tier, used, resetAtMs}) => {
  const limit = LIMITS[tier];
  const unlimited = limit === null;
  const remaining = unlimited ? null : Math.max(0, limit - used);

  return {
    tier,
    limit,
    used,
    remaining,
    unlimited,
    canSearch: unlimited || remaining > 0,
    resetAt: resetAtMs === null ? null : new Date(resetAtMs).toISOString(),
    timeZone: tier === 'free' ? QUOTA_TIME_ZONE : null,
    window:
      tier === 'visitor' ?
        'rolling-24-hours' :
        tier === 'free' ?
          'calendar-day' :
          'unlimited',
  };
};

const evaluateVisitorQuota = ({nowMs, reservations = []}) => {
  assertTime(nowMs);

  if (!Array.isArray(reservations)) {
    throw new TypeError('Visitor reservations must be an array.');
  }

  for (const reservedAtMs of reservations) {
    assertTime(reservedAtMs);

    if (reservedAtMs > nowMs) {
      throw new TypeError('Reservation timestamp cannot be in the future.');
    }
  }

  const activeReservations = reservations
      .filter((reservedAtMs) => reservedAtMs + VISITOR_WINDOW_MS > nowMs)
      .sort((left, right) => left - right);

  const resetAtMs =
    activeReservations.length > 0 ?
      activeReservations[0] + VISITOR_WINDOW_MS :
      null;

  return {
    activeReservations,
    quota: buildStatus({
      tier: 'visitor',
      used: activeReservations.length,
      resetAtMs,
    }),
  };
};

const evaluateFreeQuota = ({nowMs, storedDayKey = null, storedUsed = 0}) => {
  assertTime(nowMs);

  if (
    storedDayKey !== null &&
    (typeof storedDayKey !== 'string' ||
      !/^\d{4}-\d{2}-\d{2}$/.test(storedDayKey))
  ) {
    throw new TypeError('Invalid stored calendar day.');
  }

  if (!Number.isSafeInteger(storedUsed) || storedUsed < 0) {
    throw new TypeError('Stored usage must be a non-negative integer.');
  }

  const dayKey = calendarDayKey(nowMs);

  if (storedDayKey !== null && storedDayKey > dayKey) {
    throw new TypeError('Stored calendar day cannot be in the future.');
  }

  const used = storedDayKey === dayKey ? storedUsed : 0;

  return {
    dayKey,
    quota: buildStatus({
      tier: 'free',
      used,
      resetAtMs: nextCalendarReset(nowMs),
    }),
  };
};

const evaluateProQuota = () =>
  buildStatus({
    tier: 'pro',
    used: null,
    resetAtMs: null,
  });

module.exports = {
  QUOTA_TIME_ZONE,
  VISITOR_WINDOW_MS,
  LIMITS,
  calendarDayKey,
  nextCalendarReset,
  evaluateVisitorQuota,
  evaluateFreeQuota,
  evaluateProQuota,
};
