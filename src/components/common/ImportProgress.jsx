import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ImportProgress({ progress, result, onClose }) {
  // 진행 중
  if (progress && !result) {
    return (
      <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/5 p-5">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-100">
              {progress.phase === "reading" && "파일 읽는 중..."}
              {progress.phase === "importing" && "대화 저장 중..."}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {progress.currentFile}
              {progress.fileTotal && (
                <span className="ml-2 text-slate-500">
                  ({progress.fileIndex}/{progress.fileTotal})
                </span>
              )}
            </p>
            {progress.currentTitle && (
              <p className="mt-0.5 truncate text-[11px] text-slate-500">
                → {progress.currentTitle}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 완료
  if (result) {
    const hasErrors = result.failed > 0 || result.errors.length > 0;
    return (
      <div
        className={`
        rounded-xl border p-5
        ${
          hasErrors
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-emerald-500/30 bg-emerald-500/5"
        }
      `}
      >
        <div className="flex items-start gap-3">
          {hasErrors ? (
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          )}

          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-100">업로드 완료</p>
            <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
              <Stat
                label="신규"
                value={result.imported}
                color="text-emerald-300"
              />
              <Stat
                label="중복 건너뜀"
                value={result.skipped}
                color="text-slate-400"
              />
              <Stat label="실패" value={result.failed} color="text-rose-300" />
            </div>

            {result.errors.length > 0 && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-amber-300 hover:text-amber-200">
                  에러 상세 보기
                </summary>
                <ul className="mt-2 space-y-1 text-[11px] text-slate-400">
                  {result.errors.map((err, i) => (
                    <li key={i} className="rounded bg-slate-900/60 px-2 py-1">
                      <span className="text-slate-300">{err.file}</span>:{" "}
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
