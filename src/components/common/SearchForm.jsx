import { Search, X, RotateCcw, FileText, MessageSquare } from "lucide-react";
import Button from "./Button";
import CategoryMultiChips from "./CategoryMultiChips";
import TagMultiSelect from "./TagMultiSelect";
import { TAG_MATCH_MODE } from "../../services/searchEngine";

export const EMPTY_QUERY = {
  keyword: "",
  searchInMessages: false,
  categories: [],
  tags: [],
  tagMatchMode: TAG_MATCH_MODE.ANY,
  startDate: "",
  endDate: "",
  analyzedFilter: "all", // 'all' | 'analyzed' | 'unanalyzed'
  minMessages: null,
  maxMessages: null,
};

export default function SearchForm({ query, onChange, onReset }) {
  const update = (patch) => onChange({ ...query, ...patch });

  const hasAnyCondition =
    query.keyword?.trim() ||
    query.categories?.length > 0 ||
    query.tags?.length > 0 ||
    query.startDate ||
    query.endDate ||
    query.analyzedFilter !== "all" ||
    query.minMessages != null ||
    query.maxMessages != null;

  return (
    <div className="space-y-5 rounded-xl border border-slate-800 bg-slate-900/40 p-5">
      {/* 키워드 */}
      <div>
        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
          키워드
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={query.keyword}
            onChange={(e) => update({ keyword: e.target.value })}
            placeholder="검색어 입력..."
            className="w-full rounded-lg border border-slate-700 bg-slate-950/60 py-2 pl-9 pr-9 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
          />
          {query.keyword && (
            <button
              onClick={() => update({ keyword: "" })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <label className="mt-2 flex cursor-pointer items-center gap-2 text-[11px] text-slate-400 hover:text-slate-300">
          <input
            type="checkbox"
            checked={query.searchInMessages}
            onChange={(e) => update({ searchInMessages: e.target.checked })}
            className="h-3.5 w-3.5 rounded border-slate-600 bg-slate-900 text-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <FileText className="h-3 w-3" />
          메시지 본문까지 검색 (느릴 수 있음)
        </label>
      </div>

      <CategoryMultiChips
        selected={query.categories}
        onChange={(v) => update({ categories: v })}
      />

      <TagMultiSelect
        selected={query.tags}
        onChange={(v) => update({ tags: v })}
        mode={query.tagMatchMode}
        onModeChange={(m) => update({ tagMatchMode: m })}
      />

      {/* 기간 */}
      <div>
        <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
          기간
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={query.startDate}
            onChange={(e) => update({ startDate: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
          />
          <span className="text-xs text-slate-500">~</span>
          <input
            type="date"
            value={query.endDate}
            onChange={(e) => update({ endDate: e.target.value })}
            className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-xs text-slate-100 focus:border-indigo-500 focus:outline-none"
          />
          {(query.startDate || query.endDate) && (
            <button
              onClick={() => update({ startDate: "", endDate: "" })}
              className="text-[11px] text-slate-500 hover:text-slate-300"
            >
              초기화
            </button>
          )}
        </div>
      </div>

      {/* 분석 상태 + 메시지 수 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
            분석 상태
          </label>
          <div className="flex gap-1">
            {[
              { key: "all", label: "전체" },
              { key: "analyzed", label: "분석됨" },
              { key: "unanalyzed", label: "미분석" },
            ].map((opt) => (
              <button
                key={opt.key}
                onClick={() => update({ analyzedFilter: opt.key })}
                className={`
                  flex-1 whitespace-nowrap rounded-lg border px-1.5 py-1.5 text-[11px] font-medium transition-colors
                  ${
                    query.analyzedFilter === opt.key
                      ? "border-indigo-500/50 bg-indigo-500/15 text-indigo-200"
                      : "border-slate-700 bg-slate-900/40 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                  }
                `}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-500">
            <MessageSquare className="h-3 w-3" />
            메시지 수
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={query.minMessages ?? ""}
              onChange={(e) =>
                update({
                  minMessages:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="최소"
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-xs text-slate-500">~</span>
            <input
              type="number"
              min="0"
              value={query.maxMessages ?? ""}
              onChange={(e) =>
                update({
                  maxMessages:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
              placeholder="최대"
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-2 py-1.5 text-xs text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 액션 */}
      {hasAnyCondition && (
        <div className="flex justify-end border-t border-slate-800 pt-3">
          <Button variant="ghost" size="sm" onClick={onReset}>
            <RotateCcw className="h-3.5 w-3.5" />
            전체 초기화
          </Button>
        </div>
      )}
    </div>
  );
}
