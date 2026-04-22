import { useEffect, useLayoutEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getCategoryStreamColor } from "../../constants/theme";
import { getCategoryLabel, formatMonthKey } from "../../utils/categoryTrend";

const MARGIN = { top: 20, right: 20, bottom: 32, left: 40 };

export default function CategoryStreamChart({
  series,
  categories,
  height = 320,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 800, height });
  const [tooltip, setTooltip] = useState(null);
  const [hoveredCategory, setHoveredCategory] = useState(null);

  // 반응형: 컨테이너 너비 측정
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.max(300, entry.contentRect.width);
        setDims((d) => ({ ...d, width: w }));
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // 차트 렌더링
  useEffect(() => {
    if (!svgRef.current || !series || series.length === 0) return;

    const { width, height } = dims;
    const innerW = width - MARGIN.left - MARGIN.right;
    const innerH = height - MARGIN.top - MARGIN.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", height);

    const g = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left}, ${MARGIN.top})`);

    // 데이터 준비 (stack)
    const stack = d3
      .stack()
      .keys(categories)
      .offset(d3.stackOffsetWiggle) // 스트림그래프 특유의 중앙 정렬
      .order(d3.stackOrderInsideOut); // 작은 값은 바깥쪽으로

    const stackedData = stack(series);

    // 스케일
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(series, (d) => d.date))
      .range([0, innerW]);

    const yMin = d3.min(stackedData, (layer) => d3.min(layer, (d) => d[0]));
    const yMax = d3.max(stackedData, (layer) => d3.max(layer, (d) => d[1]));
    const yScale = d3.scaleLinear().domain([yMin, yMax]).range([innerH, 0]);

    // 부드러운 곡선 area
    const area = d3
      .area()
      .x((d) => xScale(d.data.date))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveBasis);

    // 레이어 그리기
    g.selectAll(".stream-layer")
      .data(stackedData)
      .join("path")
      .attr("class", "stream-layer")
      .attr("d", area)
      .attr("fill", (d) => getCategoryStreamColor(d.key))
      .attr("opacity", (d) =>
        hoveredCategory === null ? 0.82 : hoveredCategory === d.key ? 1 : 0.2,
      )
      .attr("stroke", "none")
      .style("cursor", "pointer")
      .on("mouseenter", (event, d) => {
        setHoveredCategory(d.key);
      })
      .on("mousemove", (event, d) => {
        const [mx] = d3.pointer(event, g.node());
        const hoveredDate = xScale.invert(mx);
        // 가장 가까운 월 찾기
        const bisect = d3.bisector((row) => row.date).left;
        const idx = Math.min(
          series.length - 1,
          Math.max(0, bisect(series, hoveredDate)),
        );
        const row = series[idx];

        const rect = containerRef.current.getBoundingClientRect();
        setTooltip({
          category: d.key,
          monthKey: row.monthKey,
          count: row[d.key] || 0,
          total: row.total,
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
        });
      })
      .on("mouseleave", () => {
        setHoveredCategory(null);
        setTooltip(null);
      });

    // X축 (월 단위)
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(series.length, 8))
      .tickFormat((d) => d3.timeFormat("%Y.%-m")(d));

    g.append("g")
      .attr("transform", `translate(0, ${innerH})`)
      .call(xAxis)
      .call((sel) => {
        sel.select(".domain").attr("stroke", "#334155");
        sel.selectAll(".tick line").attr("stroke", "#334155");
        sel
          .selectAll(".tick text")
          .attr("fill", "#94a3b8")
          .attr("font-size", 10);
      });

    // Y축 (대화 수 스케일 — 양수 절대값만)
    const yAxis = d3
      .axisLeft(yScale)
      .ticks(4)
      .tickFormat((d) => {
        const abs = Math.abs(d - (yMin + yMax) / 2);
        return abs < 0.5 ? "" : Math.round(abs);
      });

    g.append("g")
      .call(yAxis)
      .call((sel) => {
        sel.select(".domain").attr("stroke", "#334155");
        sel
          .selectAll(".tick line")
          .attr("stroke", "#1e293b")
          .attr("stroke-dasharray", "2,2");
        sel
          .selectAll(".tick text")
          .attr("fill", "#64748b")
          .attr("font-size", 10);
      });
  }, [series, categories, dims, hoveredCategory]);

  if (!series || series.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-slate-800 text-sm text-slate-500">
        분석된 대화가 없어서 표시할 데이터가 없어요.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full" />

      {tooltip && (
        <StreamTooltip tooltip={tooltip} containerWidth={dims.width} />
      )}

      {/* 범례 */}
      <div className="mt-3 flex flex-wrap gap-2">
        {categories.map((cat) => {
          const color = getCategoryStreamColor(cat);
          const active = hoveredCategory === null || hoveredCategory === cat;
          return (
            <button
              key={cat}
              onMouseEnter={() => setHoveredCategory(cat)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`
                flex items-center gap-1.5 rounded-full border border-slate-700 px-2.5 py-1 text-[11px] font-medium transition-opacity
                ${active ? "opacity-100" : "opacity-40"}
              `}
            >
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: color }}
              />
              <span className="text-slate-200">{getCategoryLabel(cat)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function StreamTooltip({ tooltip, containerWidth }) {
  const tipRef = useRef(null);
  const [position, setPosition] = useState({
    left: tooltip.x,
    transform: "translate(-50%, -100%)",
  });

  const color = getCategoryStreamColor(tooltip.category);
  const percentage =
    tooltip.total > 0 ? ((tooltip.count / tooltip.total) * 100).toFixed(0) : 0;

  // 렌더 직후 툴팁 실제 폭을 측정해서 경계 넘어가는지 체크
  useLayoutEffect(() => {
    if (!tipRef.current) return;
    const tipWidth = tipRef.current.offsetWidth;
    const EDGE = 8;

    const halfWidth = tipWidth / 2;
    let left = tooltip.x;
    let transform = "translate(-50%, -100%)";

    if (tooltip.x + halfWidth > containerWidth - EDGE) {
      // 우측 경계 — 툴팁을 마우스 왼쪽으로
      left = containerWidth - EDGE;
      transform = "translate(-100%, -100%)";
    } else if (tooltip.x - halfWidth < EDGE) {
      // 좌측 경계 — 툴팁을 마우스 오른쪽으로
      left = EDGE;
      transform = "translate(0, -100%)";
    }

    setPosition({ left, transform });
  }, [tooltip.x, tooltip.y, containerWidth]);

  return (
    <div
      ref={tipRef}
      className="pointer-events-none absolute z-20 w-max rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm"
      style={{
        left: position.left,
        top: tooltip.y - 12,
        transform: position.transform,
      }}
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap">
        <span
          className="h-2 w-2 shrink-0 rounded-sm"
          style={{ backgroundColor: color }}
        />
        <span className="font-semibold text-slate-100">
          {getCategoryLabel(tooltip.category)}
        </span>
      </div>
      <div className="mt-1 whitespace-nowrap text-slate-400">
        {formatMonthKey(tooltip.monthKey)}
      </div>
      <div className="mt-0.5 whitespace-nowrap text-indigo-300">
        {tooltip.count}개
        <span className="text-slate-500"> · 전체의 {percentage}%</span>
      </div>
    </div>
  );
}
