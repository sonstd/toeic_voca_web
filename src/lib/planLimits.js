export const FREE_DAY_LIMITS = {
  basic: 20,
  intermediate: 10,
  advanced: 10,
};

export function getFreeDayLimit(level) {
  return FREE_DAY_LIMITS[level] ?? 0;
}

export function isDayUnlocked(level, day, plan) {
  if (plan === 'pro') return true;
  return day <= getFreeDayLimit(level);
}
