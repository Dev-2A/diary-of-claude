// 태그 카테고리별 색상 팔레트
export const TAG_COLORS = {
  coding: {
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    border: "border-blue-500/30",
  },
  writing: {
    bg: "bg-purple-500/15",
    text: "text-purple-300",
    border: "border-purple-500/30",
  },
  learning: {
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-500/30",
  },
  brainstorm: {
    bg: "bg-amber-500/15",
    text: "text-amber-300",
    border: "border-amber-500/30",
  },
  debug: {
    bg: "bg-rose-500/15",
    text: "text-rose-300",
    border: "border-rose-500/30",
  },
  design: {
    bg: "bg-pink-500/15",
    text: "text-pink-300",
    border: "border-pink-500/30",
  },
  analysis: {
    bg: "bg-cyan-500/15",
    text: "text-cyan-300",
    border: "border-cyan-500/30",
  },
  personal: {
    bg: "bg-indigo-500/15",
    text: "text-indigo-300",
    border: "border-indigo-500/30",
  },
  default: {
    bg: "bg-slate-500/15",
    text: "text-slate-300",
    border: "border-slate-500/30",
  },
};

export const getTagColor = (category) =>
  TAG_COLORS[category] || TAG_COLORS.default;

// 히트맵 밀도 색상 (GitHub 잔디 스타일, 5단계)
export const HEATMAP_COLORS = [
  "#1e1e24", // 0 (활동 없음)
  "#312e81", // 1
  "#4338ca", // 2
  "#6366f1", // 3
  "#a5b4fc", // 4+
];
