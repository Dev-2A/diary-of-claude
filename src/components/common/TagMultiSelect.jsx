import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { getAllTags } from "../../db/tags";

export default function TagMultiSelect({
  selected,
  onChange,
  mode,
  onModeChange,
}) {
  const [allTags, setAllTags] = useState([]);
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    getAllTags().then(setAllTags);
  }, []);

  const handleAdd = (tagName) => {
    const t = tagName.trim();
    if (!t) return;
    if (!selected.includes(t)) {
      onChange([...selected, t]);
    }
    setInput("");
    setShowSuggestions(false);
  };

  const handleRemove = (tagName) => {
    onChange(selected.filter((t) => t !== tagName));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd(input);
    } else if (e.key === "Backspace" && !input && selected.length > 0) {
      handleRemove(selected[selected.length - 1]);
    }
  };

  const suggestions = input.trim()
    ? allTags
        .filter(
          (t) =>
            t.name.toLowerCase().includes(input.toLowerCase()) &&
            !selected.includes(t.name),
        )
        .slice(0, 8)
    : [];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
          태그
        </label>
        {selected.length > 0 && (
          <div className="flex gap-1 text-[10px]">
            <button
              onClick={() => onModeChange("any")}
              className={`rounded px-2 py-0.5 transition-colors ${
                mode === "any"
                  ? "bg-indigo-500/20 text-indigo-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              하나라도 (OR)
            </button>
            <button
              onClick={() => onModeChange("all")}
              className={`rounded px-2 py-0.5 transition-colors ${
                mode === "all"
                  ? "bg-indigo-500/20 text-indigo-200"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              모두 (AND)
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-2">
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-indigo-500/40 bg-indigo-500/15 px-2 py-0.5 text-[11px] text-indigo-200"
            >
              {tag}
              <button
                onClick={() => handleRemove(tag)}
                className="text-indigo-300 hover:text-indigo-100"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}

          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowSuggestions(true);
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder={
                selected.length === 0 ? "태그 입력 후 Enter (예: React)" : ""
              }
              className="min-w-[100px] flex-1 bg-transparent px-1 py-0.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
            />

            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute left-0 top-full z-10 mt-1 max-h-48 w-56 overflow-auto rounded-lg border border-slate-700 bg-slate-950 shadow-xl">
                {suggestions.map((t) => (
                  <button
                    key={t.id}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleAdd(t.name);
                    }}
                    className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs text-slate-200 hover:bg-slate-800"
                  >
                    <span className="flex items-center gap-1.5">
                      <Plus className="h-3 w-3 text-slate-500" />
                      {t.name}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {t.usage_count}회
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
