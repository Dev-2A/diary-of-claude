import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  aggregateByDate,
  getYearDates,
  computeDensityLevels,
  toDateKey,
} from "../../utils/dateAggregation";
import { HEATMAP_COLORS } from "../../constants/theme";

const CELL_SIZE = 12;
const CELL_GAP = 3;
const MONTH_LABEL_HEIGHT = 18;
const WEEKDAY_LABEL_WIDTH = 28;

const WEEKDAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];
const MONTH_LABELS = [
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
  "10월",
  "11월",
  "12월",
];

export default function ActivityHeatmap({ conversations, year, onDayClick }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const dates = getYearDates(year);
    const aggregated = aggregateByDate(conversations);
    const counts = dates.map((d) => aggregated.get(toDateKey(d))?.count || 0);
    const densityFn = computeDensityLevels(counts);

    // 연도의 첫날이 무슨 요일인지에 따라 시작 열의 빈 칸 계산
    const firstDay = dates[0];
    const firstDayOfWeek = firstDay.getDay(); // 0=일, 6=토

    // 주(week) 단위 컬럼 인덱스 계산
    const weekCols = [];
    let currentWeek = 0;
    for (let i = 0; i < dates.length; i++) {
      const d = dates[i];
      const dayOfWeek = d.getDay();
      // 일요일이면 새 주 시작 (단, 첫날이 일요일이 아닐 수도 있음)
      if (i > 0 && dayOfWeek === 0) currentWeek += 1;
      weekCols.push({ date: d, week: currentWeek, day: dayOfWeek });
    }

    const totalWeeks = weekCols[weekCols.length - 1].week + 1;
    const width = WEEKDAY_LABEL_WIDTH + totalWeeks * (CELL_SIZE + CELL_GAP);
    const height = MONTH_LABEL_HEIGHT + 7 * (CELL_SIZE + CELL_GAP);

    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(0, ${MONTH_LABEL_HEIGHT})`);

    // 요일 라벨 (월/수/금만 표시 — 공간 절약)
    g.selectAll(".weekday-label")
      .data([1, 3, 5])
      .join("text")
      .attr("class", "weekday-label")
      .attr("x", 0)
      .attr("y", (d) => d * (CELL_SIZE + CELL_GAP) + CELL_SIZE - 2)
      .attr("fill", "#64748b")
      .attr("font-size", 10)
      .text((d) => WEEKDAY_LABELS[d]);

    // 월 라벨 (해당 월이 시작하는 주 컬럼 위에 표시)
    const monthStarts = [];
    let lastMonth = -1;
    for (const cell of weekCols) {
      const m = cell.date.getMonth();
      if (m !== lastMonth && cell.date.getDate() <= 7) {
        monthStarts.push({ month: m, week: cell.week });
        lastMonth = m;
      }
    }

    svg
      .selectAll(".month-label")
      .data(monthStarts)
      .join("text")
      .attr("class", "month-label")
      .attr("x", (d) => WEEKDAY_LABEL_WIDTH + d.week * (CELL_SIZE + CELL_GAP))
      .attr("y", 12)
      .attr("fill", "#94a3b8")
      .attr("font-size", 10)
      .attr("font-weight", 500)
      .text((d) => MONTH_LABELS[d.month]);

    // 히트맵 셀
    const today = toDateKey(new Date());

    g.selectAll(".day-cell")
      .data(weekCols)
      .join("rect")
      .attr("class", "day-cell")
      .attr("x", (d) => WEEKDAY_LABEL_WIDTH + d.week * (CELL_SIZE + CELL_GAP))
      .attr("y", (d) => d.day * (CELL_SIZE + CELL_GAP))
      .attr("width", CELL_SIZE)
      .attr("height", CELL_SIZE)
      .attr("rx", 2)
      .attr("ry", 2)
      .attr("fill", (d) => {
        const key = toDateKey(d.date);
        const count = aggregated.get(key)?.count || 0;
        return HEATMAP_COLORS[densityFn(count)];
      })
      .attr("stroke", (d) => (toDateKey(d.date) === today ? "#a5b4fc" : "none"))
      .attr("stroke-width", 1)
      .style("cursor", (d) => {
        const count = aggregated.get(toDateKey(d.date))?.count || 0;
        return count > 0 ? "pointer" : "default";
      })
      .on("mouseenter", (event, d) => {
        const key = toDateKey(d.date);
        const entry = aggregated.get(key);
        const rect = containerRef.current.getBoundingClientRect();
        const cellRect = event.target.getBoundingClientRect();
        setTooltip({
          date: d.date,
          count: entry?.count || 0,
          conversations: entry?.conversations || [],
          x: cellRect.left - rect.left + CELL_SIZE / 2,
          y: cellRect.top - rect.top - 8,
        });
      })
      .on("mouseleave", () => {
        setTooltip(null);
      })
      .on("click", (event, d) => {
        const entry = aggregated.get(toDateKey(d.date));
        if (entry && entry.count > 0) {
          onDayClick?.(d.date, entry.conversations);
        }
      });
  }, [conversations, year, onDayClick]);

  return (
    <div ref={containerRef} className="relative">
      <div className="overflow-x-auto pb-1">
        <svg ref={svgRef} />
      </div>

      {tooltip && <HeatmapTooltip tooltip={tooltip} />}

      {/* 범례 */}
      <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-slate-500">
        <span>적음</span>
        <div className="flex gap-0.5">
          {HEATMAP_COLORS.map((color, i) => (
            <div
              key={i}
              className="h-2.5 w-2.5 rounded-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <span>많음</span>
      </div>
    </div>
  );
}

function HeatmapTooltip({ tooltip }) {
  const dateStr = tooltip.date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm"
      style={{ left: tooltip.x, top: tooltip.y }}
    >
      <div className="font-medium text-slate-100">{dateStr}</div>
      {tooltip.count > 0 ? (
        <>
          <div className="mt-0.5 text-indigo-300">{tooltip.count}개의 대화</div>
          {tooltip.conversations.length > 0 && (
            <ul className="mt-1.5 max-w-[240px] space-y-0.5">
              {tooltip.conversations.slice(0, 3).map((c) => (
                <li key={c.id} className="truncate text-[10px] text-slate-400">
                  · {c.title}
                </li>
              ))}
              {tooltip.conversations.length > 3 && (
                <li className="text-[10px] text-slate-500">
                  외 {tooltip.conversations.length - 3}개
                </li>
              )}
            </ul>
          )}
        </>
      ) : (
        <div className="mt-0.5 text-slate-500">활동 없음</div>
      )}
    </div>
  );
}
