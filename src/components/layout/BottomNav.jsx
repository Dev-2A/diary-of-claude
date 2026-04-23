import * as Icons from "lucide-react";
import { NAV_ITEMS } from "../../constants/routes";

export default function BottomNav({ currentRoute, onNavigate }) {
  const items = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-md md:hidden">
      <div className="safe-area-bottom flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = Icons[item.icon];
          const active = currentRoute === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`
                group relative flex flex-1 flex-col items-center gap-0.5 rounded-lg px-2 py-1.5 transition-all
                ${active ? "text-indigo-300" : "text-slate-500 hover:text-slate-300"}
              `}
            >
              {active && (
                <span className="absolute -top-2 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400" />
              )}
              {Icon && (
                <Icon
                  className={`h-5 w-5 transition-transform ${active ? "scale-110" : "group-hover:scale-105"}`}
                />
              )}
              <span
                className={`text-[10px] font-medium ${active ? "font-semibold" : ""}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
