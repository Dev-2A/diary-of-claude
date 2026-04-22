import { TAG_CATEGORIES } from "../db/schema";

/**
 * 정렬 옵션
 */
export const SORT_OPTIONS = [
  { key: "newest", label: "최신순", field: "created_at", order: "desc" },
  { key: "oldest", label: "오래된 순", field: "created_at", order: "asc" },
  {
    key: "longest",
    label: "메시지 많은 순",
    field: "message_count",
    order: "desc",
  },
  {
    key: "shortest",
    label: "메시지 적은 순",
    field: "message_count",
    order: "asc",
  },
  { key: "title", label: "제목 (가나다)", field: "title", order: "asc" },
];

export const DEFAULT_SORT_KEY = "newest";

/**
 * 카테고리 라벨 (한국어)
 */
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

/**
 * 카테고리 필터 옵션
 */
export const CATEGORY_FILTER_OPTIONS = [
  { key: "all", label: "전체" },
  { key: "analyzed", label: "분석 완료" },
  { key: "unanalyzed", label: "미분석" },
  ...TAG_CATEGORIES.map((cat) => ({
    key: cat,
    label: CATEGORY_LABELS[cat] || cat,
  })),
];

/**
 * 대화 배열에 필터 + 검색 + 정렬을 적용
 */
export function applyFiltersAndSort(
  conversations,
  { categoryFilter = "all", searchQuery = "", sortKey = DEFAULT_SORT_KEY },
) {
  let result = conversations;

  // 1. 카테고리 필터
  if (categoryFilter === "analyzed") {
    result = result.filter((c) => c.is_analyzed);
  } else if (categoryFilter === "unanalyzed") {
    result = result.filter((c) => !c.is_analyzed);
  } else if (categoryFilter !== "all") {
    result = result.filter((c) => c.tag_category === categoryFilter);
  }

  // 2. 검색어 (제목 + 요약 + 태그 + raw_preview)
  const q = searchQuery.trim().toLowerCase();
  if (q) {
    result = result.filter((c) => {
      const haystack = [
        c.title,
        c.summary,
        c.raw_preview,
        ...(c.tags || []),
        ...(c.keywords || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  // 3. 정렬
  const sortOpt =
    SORT_OPTIONS.find((s) => s.key === sortKey) || SORT_OPTIONS[0];
  const { field, order } = sortOpt;
  result = [...result].sort((a, b) => {
    const av = a[field] ?? "";
    const bv = b[field] ?? "";
    if (av < bv) return order === "asc" ? -1 : 1;
    if (av > bv) return order === "asc" ? 1 : -1;
    return 0;
  });

  return result;
}
