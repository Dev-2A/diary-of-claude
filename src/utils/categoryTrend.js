/**
 * 월별 카테고리 집계
 *
 * @returns {Array<{ month: string, monthKey: string, date: Date, ...categories }>}
 *  예: [
 *    { month: '2026-01', date: Date, coding: 3, writing: 1, learning: 2, ... },
 *    { month: '2026-02', date: Date, coding: 5, ... },
 *  ]
 */

import { TAG_CATEGORIES } from "../db/schema";

const CATEGORY_LABELS = {
  coding: "코딩",
  writing: "글쓰기",
  learning: "학습",
  brainstorm: "브레인스토밍",
  debug: "디버깅",
  design: "디자인",
  analysis: "분석",
  personal: "개인",
};

export const getCategoryLabel = (cat) => CATEGORY_LABELS[cat] || cat;

/**
 * "YYYY-MM" 월 키 추출
 */
function toMonthKey(isoOrDate) {
  const d = isoOrDate instanceof Date ? isoOrDate : new Date(isoOrDate);
  if (isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/**
 * 월 키 → Date (월 1일)
 */
function monthKeyToDate(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

/**
 * 범위 내 모든 월 키 생성 (빈 달도 포함)
 */
function getMonthKeyRange(startKey, endKey) {
  const result = [];
  const [sy, sm] = startKey.split("-").map(Number);
  const [ey, em] = endKey.split("-").map(Number);
  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    result.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return result;
}

/**
 * 분석된 대화만으로 월별 카테고리 집계
 */
export function aggregateCategoryByMonth(conversations) {
  const analyzed = conversations.filter((c) => c.is_analyzed && c.tag_category);
  if (analyzed.length === 0) {
    return { series: [], categories: [], empty: true };
  }

  // 1. 월 x 카테고리 매트릭스
  const matrix = new Map(); // monthKey → { category: count }
  const categoriesInUse = new Set();

  for (const c of analyzed) {
    const key = toMonthKey(c.created_at);
    if (!key) continue;
    if (!matrix.has(key)) matrix.set(key, {});
    const row = matrix.get(key);
    const cat = c.tag_category;
    row[cat] = (row[cat] || 0) + 1;
    categoriesInUse.add(cat);
  }

  if (matrix.size === 0) {
    return { series: [], categories: [], empty: true };
  }

  // 2. 범위의 모든 월 채우기 (빈 달 0으로)
  const monthKeys = Array.from(matrix.keys()).sort();
  const fullRange = getMonthKeyRange(
    monthKeys[0],
    monthKeys[monthKeys.length - 1],
  );
  const categories = TAG_CATEGORIES.filter((cat) => categoriesInUse.has(cat));

  const series = fullRange.map((key) => {
    const row = matrix.get(key) || {};
    const entry = {
      monthKey: key,
      date: monthKeyToDate(key),
    };
    for (const cat of categories) {
      entry[cat] = row[cat] || 0;
    }
    entry.total = categories.reduce((s, cat) => s + entry[cat], 0);
    return entry;
  });

  return { series, categories, empty: false };
}

/**
 * 카테고리별 전체 합계 (범례 정렬용)
 */
export function totalByCategory(series, categories) {
  const totals = {};
  for (const cat of categories) {
    totals[cat] = series.reduce((s, row) => s + (row[cat] || 0), 0);
  }
  return totals;
}

/**
 * 특정 카테고리의 피크 월 찾기
 */
export function findPeakMonth(series, category) {
  let peak = { monthKey: null, count: 0 };
  for (const row of series) {
    if ((row[category] || 0) > peak.count) {
      peak = { monthKey: row.monthKey, count: row[category] };
    }
  }
  return peak;
}

/**
 * 월 키를 사람이 읽는 형식으로 ("2026년 4월")
 */
export function formatMonthKey(key) {
  const [y, m] = key.split("-").map(Number);
  return `${y}년 ${m}월`;
}
