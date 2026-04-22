import { TrendingUp } from "lucide-react";
import { getCategoryStreamColor } from "../../constants/theme";
import {
  getCategoryLabel,
  totalByCategory,
  findPeakMonth,
  formatMonthKey,
} from "../../utils/categoryTrend";

export default function CategoryRankingList({ series, categories }) {
  const totals = totalByCategory(series, categories);
  const maxTotal = Math.max(1, ...Object.values(totals));

  // 많은 순으로 정렬
  const sorted = [...categories].sort(
    (a, b) => (totals[b] || 0) - (totals[a] || 0),
  );

  return (
    <div className="space-y-2">
      <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
        <TrendingUp className="h-3 w-3" />
        카테고리 순위
      </h4>

      <ul className="space-y-2">
        {sorted.map((cat, idx) => {
          const total = totals[cat] || 0;
          const color = getCategoryStreamColor(cat);
          const widthPct = Math.round((total / maxTotal) * 100);
          const peak = findPeakMonth(series, cat);

          return (
            <li
              key={cat}
              className="rounded-lg border border-slate-800 bg-slate-900/40 p-3"
            >
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold tabular-nums text-slate-600">
                    {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="h-2.5 w-2.5 rounded-sm"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-slate-100">
                    {getCategoryLabel(cat)}
                  </span>
                </div>
                <span className="text-sm font-bold tabular-nums text-slate-200">
                  {total}
                </span>
              </div>

              <div className="mt-2 h-1 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${widthPct}%`, backgroundColor: color }}
                />
              </div>

              {peak.monthKey && (
                <p className="mt-1.5 text-[10px] text-slate-500">
                  피크: {formatMonthKey(peak.monthKey)} ({peak.count}개)
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
