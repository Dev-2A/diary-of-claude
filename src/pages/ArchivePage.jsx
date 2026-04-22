import { useEffect, useState } from "react";
import { Sparkles, MessageSquare, Calendar, KeyRound } from "lucide-react";
import FileDropzone from "../components/common/FileDropzone";
import ImportProgress from "../components/common/ImportProgress";
import AnalysisProgress from "../components/common/AnalysisProgress";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import TagBadge, { CategoryBadge } from "../components/common/TagBadge";
import { useFileImport } from "../hooks/useFileImport";
import { useAnalyzer } from "../hooks/useAnalyzer";
import { useApiKey } from "../hooks/useApiKey";
import { getAllConversations } from "../db";

export default function ArchivePage() {
  const importer = useFileImport();
  const analyzer = useAnalyzer();
  const { hasKey } = useApiKey();

  const [conversations, setConversations] = useState([]);

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
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            저장된 대화 ({conversations.length})
          </h3>
        </div>

        {conversations.length === 0 ? (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
            아직 저장된 대화가 없어요. 위 영역에 파일을 끌어다 놓아보세요.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {conversations.slice(0, 12).map((conv) => (
              <Card key={conv.id} className="p-4" hoverable>
                <div className="flex items-start gap-2">
                  <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-indigo-400" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="min-w-0 flex-1 truncate font-medium text-slate-100">{conv.title}</h4>
                      {conv.tag_category && (
                        <CategoryBadge category={conv.tag_category} size="xs" />
                      )}
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(conv.created_at).toLocaleDateString("ko-KR")}
                      </span>
                      <span>· {conv.message_count}개 메시지</span>
                    </div>

                    {conv.summary ? (
                      <p className="mt-2 line-clamp-2 text-[11px] text-slate-300">
                        {conv.summary}
                      </p>
                    ) : conv.raw_preview ? (
                      <p className="mt-2 line-clamp-2 text-[11px] text-slate-400">
                        {conv.raw_preview}
                      </p>
                    ) : null}

                    {conv.tags && conv.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {conv.tags.slice(0, 4).map((tag) => (
                          <TagBadge
                            key={tag}
                            tag={tag}
                            category={conv.tag_category}
                            size="xs"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {conversations.length > 12 && (
          <p className="mt-3 text-center text-xs text-slate-500">
            상위 12개만 표시 중 · 전체 목록은 Step 7에서 구현 예정
          </p>
        )}
      </div>
    </div>
  );
}
