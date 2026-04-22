/**
 * YYYY-MM-DD 포맷으로 날짜 키 추출
 */
export function toDateKey(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * 대화 배열 → 날짜별 집계
 * @returns {Map<string, { count, conversations: Array }>}
 */
export function aggregateByDate(conversations) {
  const map = new Map();
  for (const c of conversations) {
    const key = toDateKey(c.created_at);
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, { count: 0, conversations: [] });
    }
    const entry = map.get(key);
    entry.count += 1;
    entry.conversations.push(c);
  }
  return map;
}

/**
 * 특정 연도의 전체 날짜 배열 (1/1 ~ 12/31)
 */
export function getYearDates(year) {
  const dates = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  const d = new Date(start);
  while (d <= end) {
    dates.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/**
 * 대화 데이터에 포함된 연도 목록 (내림차순)
 */
export function getAvailableYears(conversations) {
  const years = new Set();
  for (const c of conversations) {
    const d = new Date(c.created_at);
    if (!isNaN(d.getTime())) years.add(d.getFullYear());
  }
  const arr = Array.from(years).sort((a, b) => b - a);
  // 기본적으로 현재 연도는 항상 포함
  const currentYear = new Date().getFullYear();
  if (!arr.includes(currentYear)) arr.unshift(currentYear);
  return arr;
}

/**
 * 활동 밀도 → 0~4 레벨 (분위수 기반)
 */
export function computeDensityLevels(counts) {
  const nonZero = counts.filter((n) => n > 0).sort((a, b) => a - b);
  if (nonZero.length === 0) {
    return (n) => 0;
  }
  // 분위수: 25%, 50%, 75%
  const q = (p) => nonZero[Math.floor(nonZero.length * p)];
  const q1 = q(0.25) || 1;
  const q2 = q(0.5) || 2;
  const q3 = q(0.75) || 3;

  return (n) => {
    if (n <= 0) return 0;
    if (n <= q1) return 1;
    if (n <= q2) return 2;
    if (n <= q3) return 3;
    return 4;
  };
}

/**
 * 연도 단위 요약 통계
 */
export function summarizeYear(conversations, year) {
  const dates = aggregateByDate(conversations);
  let total = 0;
  let activeDays = 0;
  let maxDay = { date: null, count: 0 };
  let currentStreak = 0;
  let longestStreak = 0;
  let streak = 0;

  const yearDates = getYearDates(year);
  for (const d of yearDates) {
    const key = toDateKey(d);
    const entry = dates.get(key);
    const count = entry?.count || 0;
    if (count > 0) {
      total += count;
      activeDays += 1;
      streak += 1;
      if (streak > longestStreak) longestStreak = streak;
      if (count > maxDay.count) maxDay = { date: key, count };
    } else {
      streak = 0;
    }
  }

  // 현재 연속 일수 — 오늘부터 거슬러 올라가며 계산
  const today = new Date();
  if (today.getFullYear() === year) {
    const d = new Date(today);
    while (true) {
      const key = toDateKey(d);
      const entry = dates.get(key);
      if (entry && entry.count > 0) {
        currentStreak += 1;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
  }

  return { total, activeDays, maxDay, currentStreak, longestStreak };
}
