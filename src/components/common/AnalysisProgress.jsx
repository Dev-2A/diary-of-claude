import { CheckCircle2, AlertCircle, Loader2, XCircle, Ban } from "lucide-react";
import Button from "./Button";

export default function AnalysisProgress({
  progress,
  result,
  onCancel,
  onClose,
  isRunning,
}) {
  // 진행 중
  if (isRunning && progress && progress.phase !== "done") {
    const pct =
      progress.total > 0
        ? Math.round(((progress.index || 0) / progress.total) * 100)
        : 0;

    return (
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold text-slate-100">
                {progress.phase === "aborted"
                  ? "취소 중..."
                  : "대화 분석 중..."}
              </p>
              <span className="text-xs tabular-nums text-slate-400">
                {progress.index || 0} / {progress.total}
              </span>
            </div>

            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>

            <p className="mt-2 text-[11px] text-slate-500">
              Claude API 호출 중 · Rate Limit 대응을 위해 요청 간 0.4초 간격
            </p>
          </div>

          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <Ban className="h-3.5 w-3.5" />
              취소
            </Button>
          )}
        </div>
      </div>
    );
  }

  // 완료
  if (result) {
    const hasErrors = result.failed > 0 || result.errors.length > 0;
    const isAllFailed = result.total > 0 && result.succeeded === 0;

    return (
      <div
        className={`
        rounded-xl border p-5
        ${
          isAllFailed
            ? "border-rose-500/30 bg-rose-500/5"
            : hasErrors
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-emerald-500/30 bg-emerald-500/5"
        }
      `}
      >
        <div className="flex items-start gap-3">
          {isAllFailed ? (
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          ) : hasErrors ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          )}

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-100">분석 완료</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <Stat label="대상" value={result.total} color="text-slate-200" />
              <Stat
                label="성공"
                value={result.succeeded}
                color="text-emerald-300"
              />
              <Stat label="실패" value={result.failed} color="text-rose-300" />
            </div>

            {result.errors.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-amber-300 hover:text-amber-200">
                  에러 상세 ({result.errors.length})
                </summary>
                <ul className="mt-2 max-h-48 space-y-1 overflow-auto text-[11px] text-slate-400">
                  {result.errors.slice(0, 20).map((err, i) => (
                    <li key={i} className="rounded bg-slate-900/60 px-2 py-1">
                      {err.id && (
                        <span className="text-slate-300">#{err.id}: </span>
                      )}
                      {err.message}
                    </li>
                  ))}
                </ul>
              </details>
            )}

            {onClose && (
              <button
                onClick={onClose}
                className="mt-3 text-xs text-indigo-300 hover:text-indigo-200"
              >
                닫기
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function Stat({ label, value, color }) {
  return (
    <div className="rounded-lg bg-slate-900/60 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-slate-500">
        {label}
      </div>
      <div className={`mt-0.5 text-lg font-bold ${color}`}>
        {value.toLocaleString()}
      </div>
    </div>
  );
}
