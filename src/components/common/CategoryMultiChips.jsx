import { TAG_CATEGORIES } from "../../db/schema";
import { getCategoryStreamColor } from "../../constants/theme";

const LABELS = {
  coding: "코딩",
  writing: "글쓰기",
  learning: "학습",
  brainstorm: "브레인스토밍",
  debug: "디버깅",
  design: "디자인",
  analysis: "분석",
  personal: "개인",
};

export default function CategoryMultiChips({ selected, onChange }) {
  const toggle = (cat) => {
    if (selected.includes(cat)) {
      onChange(selected.filter((c) => c !== cat));
    } else {
      onChange([...selected, cat]);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
        카테고리
      </label>
      <div className="flex flex-wrap gap-1.5">
        {TAG_CATEGORIES.map((cat) => {
          const active = selected.includes(cat);
          const color = getCategoryStreamColor(cat);
          return (
            <button
              key={cat}
              onClick={() => toggle(cat)}
              className={`
                flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-all
                ${
                  active
                    ? "border-slate-500 bg-slate-800 text-slate-100"
                    : "border-slate-700 bg-slate-900/40 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                }
              `}
            >
              <span
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: color, opacity: active ? 1 : 0.4 }}
              />
              {LABELS[cat] || cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}
