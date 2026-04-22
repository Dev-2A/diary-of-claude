import { splitForHighlight } from "../../services/searchEngine";

export default function HighlightedText({ text, keyword, className = "" }) {
  const parts = splitForHighlight(text, keyword);
  return (
    <span className={className}>
      {parts.map((p, i) =>
        p.highlight ? (
          <mark
            key={i}
            className="rounded bg-amber-400/30 px-0.5 text-amber-100"
          >
            {p.text}
          </mark>
        ) : (
          <span key={i}>{p.text}</span>
        ),
      )}
    </span>
  );
}
