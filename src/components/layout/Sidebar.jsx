import * as Icons from "lucide-react";
import { NAV_ITEMS } from "../../constants/routes";

export default function Sidebar({ currentRoute, onNavigate }) {
  return (
    <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 border-r border-slate-800 bg-slate-950/40 py-6 md:block">
      <nav className="flex flex-col gap-1 px-3">
        {NAV_ITEMS.map((item) => {
          const Icon = Icons[item.icon];
          const active = currentRoute === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`
                flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all
                ${
                  active
                    ? "bg-indigo-500/15 text-indigo-300 shadow-inner shadow-indigo-500/5"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
                }
              `}
            >
              {Icon && <Icon className="h-4 w-4" />}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pt-8">
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-3">
          <p className="text-[11px] leading-relaxed text-slate-500">
            모든 대화는 브라우저 내에서만 처리돼요. API 키와 원본 데이터는
            외부로 전송되지 않아요.
          </p>
        </div>
      </div>
    </aside>
  );
}
