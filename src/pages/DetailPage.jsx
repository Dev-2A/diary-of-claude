import { useState } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import MessageBubble from "../components/common/MessageBubble";
import ConversationMeta from "../components/common/ConversationMeta";
import { useConversation } from "../hooks/useConversation";
import { useApiKey } from "../hooks/useApiKey";
import { analyzeConversation } from "../services/analyzer";
import { deleteConversation } from "../db/conversations";

export default function DetailPage({ conversationId, onBack }) {
  const { conversation, loading, error, refresh } =
    useConversation(conversationId);
  const { hasKey } = useApiKey();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState(null);

  const handleReanalyze = async () => {
    if (!conversationId) return;
    setIsAnalyzing(true);
    setAnalyzeError(null);
    try {
      await analyzeConversation(conversationId);
      refresh();
    } catch (err) {
      setAnalyzeError(err.message || "분석 실패");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDelete = async () => {
    if (!conversationId) return;
    await deleteConversation(conversationId);
    onBack?.();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <BackButton onBack={onBack} />
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/40">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
        </div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="space-y-4">
        <BackButton onBack={onBack} />
        <Card className="border-rose-500/30 bg-rose-500/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
            <div>
              <h3 className="font-semibold text-slate-100">
                대화를 불러올 수 없어요
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                {error || "대화가 삭제되었거나 존재하지 않아요."}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const c = conversation;

  return (
    <div className="space-y-6">
      <BackButton onBack={onBack} />

      <div>
        <h2 className="text-2xl font-bold text-slate-100">{c.title}</h2>
        <p className="mt-1 text-xs text-slate-500">
          총 {c.messages?.length || 0}개 메시지 · 로컬 아카이브 #{c.id}
        </p>
      </div>

      {analyzeError && (
        <Card className="border-rose-500/30 bg-rose-500/5 p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
            <p className="text-xs text-rose-200">{analyzeError}</p>
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* 메시지 스레드 */}
        <div className="min-w-0 space-y-4">
          {(c.messages || []).map((msg, idx) => (
            <MessageBubble key={msg.id || idx} message={msg} index={idx} />
          ))}
          {(!c.messages || c.messages.length === 0) && (
            <Card className="p-6 text-center text-sm text-slate-500">
              이 대화에 저장된 메시지가 없어요.
            </Card>
          )}
        </div>

        {/* 메타 정보 사이드바 */}
        <aside className="lg:sticky lg:top-20 lg:h-fit">
          <ConversationMeta
            conversation={c}
            hasKey={hasKey}
            isAnalyzing={isAnalyzing}
            onReanalyze={handleReanalyze}
            onDelete={handleDelete}
          />
        </aside>
      </div>
    </div>
  );
}

function BackButton({ onBack }) {
  return (
    <Button variant="ghost" size="sm" onClick={onBack}>
      <ArrowLeft className="h-4 w-4" />
      아카이브로 돌아가기
    </Button>
  );
}
