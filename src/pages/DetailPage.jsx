import { ArrowLeft } from "lucide-react";
import Button from "../components/common/Button";

export default function DetailPage({ conversationId, onBack }) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="h-4 w-4" />
        아카이브로 돌아가기
      </Button>

      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-800 text-sm text-slate-500">
        대화 상세 #{conversationId} — Step 8에서 구현
      </div>
    </div>
  );
}
