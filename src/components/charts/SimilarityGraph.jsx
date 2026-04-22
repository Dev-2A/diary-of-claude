import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { getCategoryStreamColor } from "../../constants/theme";

const HEIGHT = 520;

export default function SimilarityGraph({ graph, onNodeClick }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const simulationRef = useRef(null);
  const [width, setWidth] = useState(800);
  const [hovered, setHovered] = useState(null);

  // 반응형 너비 측정
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setWidth(Math.max(320, entry.contentRect.width));
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // 그래프 렌더링
  useEffect(() => {
    if (!svgRef.current || !graph || graph.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("width", width).attr("height", HEIGHT);

    let simulation = null;

    try {
      // 노드 ID 집합 — 링크 검증용
      const nodeIds = new Set(graph.nodes.map((n) => n.id));

      // 노드·링크 복사 + 링크 안전 검증
      const nodes = graph.nodes.map((n) => ({ ...n }));
      const links = graph.links
        .filter((l) => {
          const src = typeof l.source === "object" ? l.source.id : l.source;
          const tgt = typeof l.target === "object" ? l.target.id : l.target;
          return nodeIds.has(src) && nodeIds.has(tgt);
        })
        .map((l) => ({ ...l }));

      const container = svg.append("g");

      // 줌·팬
      const zoom = d3
        .zoom()
        .scaleExtent([0.3, 4])
        .on("zoom", (event) => {
          container.attr("transform", event.transform);
        });
      svg.call(zoom);

      // 시뮬레이션
      simulation = d3
        .forceSimulation(nodes)
        .force(
          "link",
          d3
            .forceLink(links)
            .id((d) => d.id)
            .distance((d) => 90 + (1 - d.score) * 80)
            .strength((d) => d.score * 0.8),
        )
        .force("charge", d3.forceManyBody().strength(-180))
        .force("center", d3.forceCenter(width / 2, HEIGHT / 2))
        .force(
          "collide",
          d3.forceCollide().radius((d) => nodeRadius(d) + 4),
        );

      simulationRef.current = simulation;

      // 링크
      const link = container
        .append("g")
        .attr("stroke", "#475569")
        .attr("stroke-opacity", 0.4)
        .selectAll("line")
        .data(links)
        .join("line")
        .attr("stroke-width", (d) => 0.5 + d.score * 2);

      // 노드 그룹
      const node = container
        .append("g")
        .selectAll("g")
        .data(nodes)
        .join("g")
        .style("cursor", "pointer")
        .call(
          d3
            .drag()
            .on("start", (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on("drag", (event, d) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on("end", (event, d) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            }),
        );

      node
        .append("circle")
        .attr("r", (d) => nodeRadius(d))
        .attr("fill", (d) =>
          d.isIsolated ? "#475569" : getCategoryStreamColor(d.category),
        )
        .attr("fill-opacity", (d) => (d.isIsolated ? 0.4 : 0.85))
        .attr("stroke", "#0f172a")
        .attr("stroke-width", 1.5);

      node
        .append("text")
        .text((d) => truncate(d.title, 14))
        .attr("font-size", 9)
        .attr("fill", "#cbd5e1")
        .attr("text-anchor", "middle")
        .attr("dy", (d) => nodeRadius(d) + 11)
        .attr("pointer-events", "none")
        .style("user-select", "none");

      node
        .on("mouseenter", (event, d) => {
          const rect = containerRef.current.getBoundingClientRect();
          setHovered({
            node: d,
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });

          const connectedIds = new Set([d.id]);
          links.forEach((l) => {
            if (l.source.id === d.id) connectedIds.add(l.target.id);
            if (l.target.id === d.id) connectedIds.add(l.source.id);
          });

          node
            .select("circle")
            .attr("fill-opacity", (n) => (connectedIds.has(n.id) ? 1 : 0.15));
          node
            .select("text")
            .attr("fill-opacity", (n) => (connectedIds.has(n.id) ? 1 : 0.2));
          link
            .attr("stroke-opacity", (l) =>
              l.source.id === d.id || l.target.id === d.id ? 0.9 : 0.05,
            )
            .attr("stroke", (l) =>
              l.source.id === d.id || l.target.id === d.id
                ? "#a5b4fc"
                : "#475569",
            );
        })
        .on("mouseleave", () => {
          setHovered(null);
          node
            .select("circle")
            .attr("fill-opacity", (n) => (n.isIsolated ? 0.4 : 0.85));
          node.select("text").attr("fill-opacity", 1);
          link.attr("stroke-opacity", 0.4).attr("stroke", "#475569");
        })
        .on("click", (event, d) => {
          event.stopPropagation();
          onNodeClick?.(d.id);
        });

      simulation.on("tick", () => {
        link
          .attr("x1", (d) => d.source.x)
          .attr("y1", (d) => d.source.y)
          .attr("x2", (d) => d.target.x)
          .attr("y2", (d) => d.target.y);

        node.attr("transform", (d) => `translate(${d.x}, ${d.y})`);
      });
    } catch (err) {
      console.error("SimilarityGraph 렌더링 실패:", err);
      // 에러 발생 시 SVG에 안내 메시지
      svg.selectAll("*").remove();
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", HEIGHT / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#94a3b8")
        .attr("font-size", 13)
        .text(
          '그래프 데이터에 일시적 오류가 있어요. "유사도 재계산"을 눌러주세요.',
        );
    }

    return () => {
      if (simulation) simulation.stop();
    };
  }, [graph, width, onNodeClick]);

  if (!graph || graph.nodes.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-800 text-sm text-slate-500">
        분석된 대화가 없어요. 먼저 아카이브에서 분석을 실행해주세요.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-lg border border-slate-800 bg-slate-950/60"
    >
      <svg ref={svgRef} className="w-full" />

      {hovered && <NodeTooltip hovered={hovered} containerWidth={width} />}

      <div className="pointer-events-none absolute left-3 top-3 rounded-md bg-slate-950/70 px-2 py-1 text-[10px] text-slate-500 backdrop-blur-sm">
        노드 {graph.nodes.length}개 · 연결 {graph.links.length}개 · 드래그·줌
        가능
      </div>
    </div>
  );
}

function nodeRadius(d) {
  const base = 6;
  const size = Math.log((d.messageCount || 2) + 1) * 2.5;
  return base + size;
}

function truncate(str, n) {
  if (!str) return "";
  return str.length > n ? str.slice(0, n) + "…" : str;
}

function NodeTooltip({ hovered, containerWidth }) {
  const tipRef = useRef(null);
  const [pos, setPos] = useState({
    left: hovered.x,
    transform: "translate(-50%, -100%)",
  });

  useEffect(() => {
    if (!tipRef.current) return;
    const tipWidth = tipRef.current.offsetWidth;
    const EDGE = 8;
    const half = tipWidth / 2;
    let left = hovered.x;
    let transform = "translate(-50%, -100%)";

    if (hovered.x + half > containerWidth - EDGE) {
      left = containerWidth - EDGE;
      transform = "translate(-100%, -100%)";
    } else if (hovered.x - half < EDGE) {
      left = EDGE;
      transform = "translate(0, -100%)";
    }
    setPos({ left, transform });
  }, [hovered.x, hovered.y, containerWidth]);

  const d = hovered.node;
  const color = d.isIsolated ? "#475569" : getCategoryStreamColor(d.category);

  return (
    <div
      ref={tipRef}
      className="pointer-events-none absolute z-20 w-max max-w-xs rounded-lg border border-slate-700 bg-slate-950/95 px-3 py-2 text-xs shadow-xl backdrop-blur-sm"
      style={{
        left: pos.left,
        top: hovered.y - 12,
        transform: pos.transform,
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="h-2 w-2 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="truncate font-semibold text-slate-100">{d.title}</span>
      </div>
      {d.summary && (
        <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">
          {d.summary}
        </p>
      )}
      {d.tags && d.tags.length > 0 && (
        <p className="mt-1 text-[10px] text-indigo-300">
          {d.tags.slice(0, 3).join(" · ")}
        </p>
      )}
      <p className="mt-1 text-[10px] text-slate-500">
        클릭하면 상세 페이지로 이동해요
      </p>
    </div>
  );
}
