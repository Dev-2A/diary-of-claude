import { Search, X, ArrowUpDown } from "lucide-react";
import {
  CATEGORY_FILTER_OPTIONS,
  SORT_OPTIONS,
} from "../../utils/conversationFilters";

export default function FilterBar({
  searchQuery = "",
  onSearchChange,
  categoryFilter = "all",
  onCategoryChange,
  sortKey,
  onSortChange,
  resultCount = 0,
  totalCount = 0,
}) {
  const safeResult = Number(resultCount) || 0;
  const safeTotal = Number(totalCount) || 0;

  return (
    <div className="space-y-3">
      {/* 상단: 검색 + 정렬 */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="제목·요약·태그·키워드 검색..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              title="검색어 지우기"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="relative">
          <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <select
            value={sortKey}
            onChange={(e) => onSortChange?.(e.target.value)}
            className="appearance-none rounded-lg border border-slate-700 bg-slate-950/60 py-2 pl-9 pr-8 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.key} value={opt.key} className="bg-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 카테고리 필터 칩 */}
      <div className="flex flex-wrap items-center gap-1.5">
        {CATEGORY_FILTER_OPTIONS.map((opt) => {
          const active = categoryFilter === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onCategoryChange?.(opt.key)}
              className={`
                rounded-full border px-3 py-1 text-[11px] font-medium transition-colors
                ${
                  active
                    ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-200"
                    : "border-slate-700 bg-slate-900/40 text-slate-400 hover:border-slate-600 hover:text-slate-200"
                }
              `}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* 결과 개수 */}
      <p className="text-[11px] text-slate-500">
        {safeResult.toLocaleString()}개 표시 중
        {safeResult !== safeTotal && (
          <span className="text-slate-600">
            {" "}
            (전체 {safeTotal.toLocaleString()}개)
          </span>
        )}
      </p>
    </div>
  );
}
