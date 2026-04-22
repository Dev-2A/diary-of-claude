import { useEffect, useMemo, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import Card from "../components/common/Card";
import SearchForm, { EMPTY_QUERY } from "../components/common/SearchForm";
import SearchResultCard from "../components/common/SearchResultCard";
import Pagination from "../components/common/Pagination";
import { searchConversations } from "../services/searchEngine";

const PAGE_SIZE = 12;

// debounce
function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchPage({ onOpenConversation }) {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedQuery = useDebouncedValue(query, 350);

  // 검색 실행
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    searchConversations(debouncedQuery)
      .then((res) => {
        if (!mounted) return;
        setResults(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("검색 실패:", err);
        if (!mounted) return;
        setResults([]);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [debouncedQuery]);

  // 검색 조건 변경 시 1페이지로
  useEffect(() => {
    setPage(1);
  }, [debouncedQuery]);

  const hasAnyCondition = useMemo(() => {
    return (
      query.keyword?.trim() ||
      query.categories?.length > 0 ||
      query.tags?.length > 0 ||
      query.startDate ||
      query.endDate ||
      query.analyzedFilter !== "all" ||
      query.minMessages != null ||
      query.maxMessages != null
    );
  }, [query]);

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = results.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">검색</h2>
        <p className="mt-1 text-sm text-slate-400">
          키워드 · 카테고리 · 태그 · 기간 · 분석 상태 · 메시지 수 등 다중
          조건으로 대화를 찾아요.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* 검색 폼 */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <SearchForm
            query={query}
            onChange={setQuery}
            onReset={() => setQuery(EMPTY_QUERY)}
          />
        </aside>

        {/* 검색 결과 */}
        <div className="min-w-0 space-y-4">
          <div className="flex items-baseline justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              {hasAnyCondition ? "검색 결과" : "전체 대화"}
            </h3>
            <span className="text-xs text-slate-400">
              {loading ? (
                <Loader2 className="inline h-3 w-3 animate-spin" />
              ) : (
                <>
                  <span className="font-semibold text-slate-200">
                    {results.length.toLocaleString()}
                  </span>
                  개 발견
                </>
              )}
            </span>
          </div>

          {loading && results.length === 0 ? (
            <div className="flex h-48 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/30">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
            </div>
          ) : results.length === 0 ? (
            <Card className="p-12 text-center">
              <Search className="mx-auto h-10 w-10 text-slate-700" />
              <p className="mt-3 text-sm text-slate-400">
                {hasAnyCondition
                  ? "조건에 맞는 대화가 없어요. 조건을 완화해보세요."
                  : "저장된 대화가 없어요. 아카이브에서 파일을 먼저 업로드해주세요."}
              </p>
            </Card>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                {pageItems.map((c) => (
                  <SearchResultCard
                    key={c.id}
                    conversation={c}
                    keyword={query.keyword}
                    onClick={() => onOpenConversation?.(c.id)}
                  />
                ))}
              </div>

              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
