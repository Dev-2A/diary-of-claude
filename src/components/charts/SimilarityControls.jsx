import {
  Network,
  RefreshCw,
  Loader2,
  Ban,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Button from "../common/Button";

export default function SimilarityControls({
  threshold,
  onThresholdChange,
  nodeCount,
  linkCount,
  isRunning,
  progress,
  result,
  onRun,
  onCancel,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Network className="h-4 w-4 text-cyan-400" />
            대화 간 유사도 그래프
          </h3>
          <p className="mt-0.5 text-[11px] text-slate-500">
            태그 · 키워드 · 카테고리를 기준으로 의미적으로 가까운 대화끼리
            연결했어요
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onRun}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                계산 중...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                유사도 재계산
              </>
            )}
          </Button>
          {isRunning && onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <Ban className="h-3.5 w-3.5" />
              취소
            </Button>
          )}
        </div>
      </div>

      {/* 진행률 */}
      {isRunning && progress && (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-3">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-cyan-200">
              {progress.processed?.toLocaleString() || 0} /{" "}
              {progress.totalPairs?.toLocaleString() || 0} 쌍 계산 완료
            </span>
            <span className="text-cyan-300">
              저장된 링크: {progress.saved?.toLocaleString() || 0}개
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
              style={{
                width: `${progress.totalPairs > 0 ? (progress.processed / progress.totalPairs) * 100 : 0}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* 결과 알림 */}
      {result && !isRunning && (
        <div
          className={`
          rounded-lg border p-3 text-xs
          ${
            result.error
              ? "border-rose-500/30 bg-rose-500/5 text-rose-200"
              : "border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
          }
        `}
        >
          <div className="flex items-start gap-2">
            {result.error ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              {result.error ? (
                <span>오류: {result.error}</span>
              ) : (
                <>
                  <span className="font-semibold">유사도 계산 완료</span>
                  <span className="ml-1 opacity-80">
                    · {result.pairs?.toLocaleString()}쌍 비교 ·{" "}
                    {result.saved?.toLocaleString()}개 링크 저장
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 임계값 슬라이더 */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between text-xs">
          <label htmlFor="threshold" className="font-medium text-slate-300">
            유사도 임계값
          </label>
          <span className="tabular-nums text-indigo-300">
            {threshold.toFixed(2)}
          </span>
        </div>
        <input
          id="threshold"
          type="range"
          min="0.2"
          max="0.9"
          step="0.05"
          value={threshold}
          onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
          className="mt-2 w-full accent-indigo-500"
        />
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>느슨함 · 연결 많음</span>
          <span>엄격함 · 강한 연결만</span>
        </div>

        <div className="mt-3 flex gap-4 border-t border-slate-800 pt-3 text-[11px]">
          <span className="text-slate-400">
            노드:{" "}
            <span className="font-semibold text-slate-200">{nodeCount}</span>
          </span>
          <span className="text-slate-400">
            링크:{" "}
            <span className="font-semibold text-slate-200">{linkCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
