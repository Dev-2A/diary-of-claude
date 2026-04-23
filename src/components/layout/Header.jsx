import { BookOpen, Key, KeyRound } from "lucide-react";
import { useApiKey } from "../../hooks/useApiKey";

export default function Header({ onNavigate }) {
  const { hasKey, loading } = useApiKey();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <button
          onClick={() => onNavigate?.("home")}
          className="flex items-center gap-3 rounded-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-900/30">
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          <div className="text-left">
            <h1 className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-lg font-bold text-transparent">
              Diary of Claude
            </h1>
            <p className="hidden text-[10px] text-slate-500 sm:block">
              로컬 아카이브 & 메타 분석
            </p>
          </div>
        </button>

        <div className="flex items-center gap-2">
          <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 lg:inline-block">
            💙 100% 로컬 처리
          </span>

          {!loading && (
            <button
              onClick={() => onNavigate?.("settings")}
              className={`
                flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors
                ${
                  hasKey
                    ? "border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 animate-pulse"
                }
              `}
              title={hasKey ? "API 키 등록 완료" : "API 키 미등록"}
            >
              {hasKey ? (
                <KeyRound className="h-3 w-3" />
              ) : (
                <Key className="h-3 w-3" />
              )}
              <span className="hidden sm:inline">
                {hasKey ? "키 등록됨" : "키 없음"}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
