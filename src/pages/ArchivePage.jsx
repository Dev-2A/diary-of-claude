import { useEffect, useMemo, useState } from "react";
import { Sparkles, KeyRound } from "lucide-react";
import FileDropzone from "../components/common/FileDropzone";
import ImportProgress from "../components/common/ImportProgress";
import AnalysisProgress from "../components/common/AnalysisProgress";
import FilterBar from "../components/common/FilterBar";
import ConversationCard from "../components/common/ConversationCard";
import Pagination from "../components/common/Pagination";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useFileImport } from "../hooks/useFileImport";
import { useAnalyzer } from "../hooks/useAnalyzer";
import { useApiKey } from "../hooks/useApiKey";
import { getAllConversations } from "../db";
import {
  applyFiltersAndSort,
  DEFAULT_SORT_KEY,
} from "../utils/conversationFilters";

const PAGE_SIZE = 12;

export default function ArchivePage({ onOpenConversation }) {
  const importer = useFileImport();
  const analyzer = useAnalyzer();
  const { hasKey } = useApiKey();

  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortKey, setSortKey] = useState(DEFAULT_SORT_KEY);
  const [currentPage, setCurrentPage] = useState(1);

  // 업로드·분석 완료 시 목록 갱신
  useEffect(() => {
    let mounted = true;
    getAllConversations().then((list) => {
      if (mounted) setConversations(list);
    });
    return () => {
      mounted = false;
    };
  }, [importer.result, analyzer.result]);

  // 필터·검색·정렬 적용
  const filtered = useMemo(
    () =>
      applyFiltersAndSort(conversations, {
        categoryFilter,
        searchQuery,
        sortKey,
      }),
    [conversations, categoryFilter, searchQuery, sortKey],
  );

  // 페이지네이션
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // 필터·검색 변경 시 1페이지로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortKey]);

  const unanalyzedCount = conversations.filter((c) => !c.is_analyzed).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">아카이브</h2>
        <p className="mt-1 text-sm text-slate-400">
          Claude 대화 export 파일을 업로드하면 로컬 DB에 저장돼요. 등록 후 분석
          버튼으로 자동 태깅·요약을 돌릴 수 있어요.
        </p>
      </div>

      <FileDropzone
        onFiles={importer.run}
        disabled={importer.isImporting || analyzer.isRunning}
      />

      {(importer.progress || importer.result) && (
        <ImportProgress
          progress={importer.progress}
          result={importer.result}
          onClose={importer.result ? importer.clear : null}
        />
      )}

      {/* 분석 컨트롤 */}
      <Card className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <h3 className="font-semibold text-slate-100">자동 분석</h3>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              아직 분석되지 않은 대화:{" "}
              <span className="font-semibold text-indigo-300">
                {unanalyzedCount}
              </span>
              개
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!hasKey && (
              <span className="flex items-center gap-1 text-[11px] text-amber-300">
                <KeyRound className="h-3 w-3" />
                API 키를 먼저 등록해주세요
              </span>
            )}
            <Button
              onClick={analyzer.runAll}
              disabled={
                !hasKey ||
                unanalyzedCount === 0 ||
                analyzer.isRunning ||
                importer.isImporting
              }
            >
              <Sparkles className="h-4 w-4" />
              전체 분석 시작
            </Button>
          </div>
        </div>
      </Card>

      {(analyzer.progress || analyzer.result) && (
        <AnalysisProgress
          progress={analyzer.progress}
          result={analyzer.result}
          isRunning={analyzer.isRunning}
          onCancel={analyzer.isRunning ? analyzer.cancel : null}
          onClose={analyzer.result ? analyzer.clear : null}
        />
      )}

      {/* 대화 목록 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            저장된 대화
          </h3>
        </div>

        {conversations.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
            아직 저장된 대화가 없어요. 위 영역에 파일을 끌어다 놓아보세요.
          </div>
        ) : (
          <>
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              sortKey={sortKey}
              onSortChange={setSortKey}
              resultCount={filtered.length}
              totalCount={conversations.length}
            />

            {filtered.length === 0 ? (
              <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
                조건에 맞는 대화가 없어요.
              </div>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {pageItems.map((conv) => (
                    <ConversationCard
                      key={conv.id}
                      conversation={conv}
                      onClick={() => onOpenConversation?.(conv.id)}
                    />
                  ))}
                </div>

                <Pagination
                  currentPage={safePage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
