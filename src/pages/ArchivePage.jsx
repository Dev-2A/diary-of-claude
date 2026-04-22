import { useEffect, useState } from "react";
import FileDropzone from "../components/common/FileDropzone";
import ImportProgress from "../components/common/ImportProgress";
import Card from "../components/common/Card";
import { useFileImport } from "../hooks/useFileImport";
import { getAllConversations } from "../db";
import { MessageSquare, Calendar } from "lucide-react";

export default function ArchivePage() {
  const { run, clear, progress, result, isImporting } = useFileImport();
  const [conversations, setConversations] = useState([]);

  // 업로드 완료 시 목록 갱신
  useEffect(() => {
    let mounted = true;
    getAllConversations().then((list) => {
      if (mounted) setConversations(list);
    });
    return () => {
      mounted = false;
    };
  }, [result]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">아카이브</h2>
        <p className="mt-1 text-sm text-slate-400">
          Claude 대화 export 파일을 업로드하면 로컬 DB에 저장돼요.
        </p>
      </div>

      <FileDropzone onFiles={run} disabled={isImporting} />

      {(progress || result) && (
        <ImportProgress
          progress={progress}
          result={result}
          onClose={result ? clear : null}
        />
      )}

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
                    <h4 className="truncate font-medium text-slate-100">
                      {conv.title}
                    </h4>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(conv.created_at).toLocaleDateString("ko-KR")}
                      </span>
                      <span>· {conv.message_count}개 메시지</span>
                    </div>
                    {conv.raw_preview && (
                      <p className="mt-2 line-clamp-2 text-[11px] text-slate-400">
                        {conv.raw_preview}
                      </p>
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
