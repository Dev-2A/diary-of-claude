import * as Icons from "lucide-react";
import { NAV_ITEMS } from "../../constants/routes";

export default function BottomNav({ currentRoute, onNavigate }) {
  // 모바일은 상위 5개만
  const items = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = Icons[item.icon];
          const active = currentRoute === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`
                flex flex-1 flex-col items-center gap-1 rounded-lg px-2 py-1.5 transition-all
                ${active ? "text-indigo-300" : "text-slate-500"}
              `}
            >
              {Icon && <Icon className="h-5 w-5" />}
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
