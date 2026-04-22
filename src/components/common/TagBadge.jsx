import { getTagColor } from "../../constants/theme";

export default function TagBadge({ tag, category, size = "sm" }) {
  const color = getTagColor(category);
  const sizeCls =
    size === "xs" ? "text-[10px] px-1.5 py-0.5" : "text-[11px] px-2 py-0.5";

  return (
    <span
      className={`
      inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-medium
      ${color.bg} ${color.text} ${color.border} ${sizeCls}
    `}
    >
      {tag}
    </span>
  );
}

const CATEGORY_LABELS = {
  coding: "코딩",
  writing: "글쓰기",
  learning: "학습",
  brainstorm: "브레인스토밍",
  debug: "디버깅",
  design: "디자인",
  analysis: "분석",
  personal: "개인",
};

export function CategoryBadge({ category, size = "sm" }) {
  if (!category) return null;
  const color = getTagColor(category);
  const sizeCls =
    size === "xs" ? "text-[10px] px-2 py-0.5" : "text-[11px] px-2.5 py-0.5";

  return (
    <span
      className={`
      inline-flex shrink-0 items-center whitespace-nowrap rounded-full border font-medium
      ${color.bg} ${color.text} ${color.border} ${sizeCls}
    `}
    >
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}
