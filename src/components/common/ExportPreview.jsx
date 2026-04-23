import { Eye, Download, Copy, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import Button from "./Button";

export default function ExportPreview({
  content,
  filename,
  isGenerating,
  onDownload,
  onCopy,
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await onCopy();
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-slate-800 bg-slate-950/40">
        <div className="flex flex-col items-center gap-2 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-xs">생성 중...</span>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-800 text-sm text-slate-500">
        대화를 선택하면 미리보기가 여기에 표시돼요
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Eye className="h-3.5 w-3.5" />
          미리보기
          <span className="text-slate-600">·</span>
          <code className="text-[10px] text-slate-400">{filename}</code>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
                복사됨
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                복사
              </>
            )}
          </Button>
          <Button onClick={onDownload}>
            <Download className="h-3.5 w-3.5" />
            다운로드
          </Button>
        </div>
      </div>

      <pre className="max-h-[480px] overflow-auto rounded-lg border border-slate-800 bg-slate-950/60 p-4 text-[11px] leading-relaxed text-slate-300">
        <code>{content}</code>
      </pre>

      <div className="text-right text-[10px] text-slate-500">
        총 {content.length.toLocaleString()}자
      </div>
    </div>
  );
}
