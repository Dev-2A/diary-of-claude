import { FileText, FileJson, BookOpen, GitBranch } from "lucide-react";

const FORMATS = [
  {
    key: "markdown",
    name: "Markdown",
    icon: FileText,
    description: "범용 .md 파일 — 어디서나 열람 가능",
    color: "text-slate-300",
  },
  {
    key: "json",
    name: "JSON",
    icon: FileJson,
    description: "Claude 공식 export 호환 + Diary 메타 포함",
    color: "text-amber-300",
  },
  {
    key: "notion",
    name: "Notion",
    icon: BookOpen,
    description: "Notion 임포트 최적화 — 토글, 콜아웃 활용",
    color: "text-purple-300",
  },
  {
    key: "github",
    name: "GitHub Issue",
    icon: GitBranch,
    description: "체크리스트 형식 — 이슈 본문에 붙여넣기",
    color: "text-emerald-300",
  },
];

export default function ExportFormatSelector({ value, onChange }) {
  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
        내보내기 포맷
      </label>
      <div className="grid gap-2 sm:grid-cols-2">
        {FORMATS.map((f) => {
          const Icon = f.icon;
          const active = value === f.key;
          return (
            <button
              key={f.key}
              onClick={() => onChange(f.key)}
              className={`
                flex items-start gap-3 rounded-lg border p-3 text-left transition-all
                ${
                  active
                    ? "border-indigo-500/50 bg-indigo-500/10 shadow-inner shadow-indigo-500/5"
                    : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                }
              `}
            >
              <Icon
                className={`h-4 w-4 shrink-0 ${active ? "text-indigo-300" : f.color}`}
              />
              <div className="min-w-0">
                <div
                  className={`text-sm font-semibold ${active ? "text-indigo-100" : "text-slate-100"}`}
                >
                  {f.name}
                </div>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {f.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
