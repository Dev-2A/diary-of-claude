export default function Card({
  children,
  className = "",
  hoverable = false,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`
        rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm transition-all duration-200
        ${
          hoverable
            ? "cursor-pointer hover:-translate-y-0.5 hover:border-indigo-500/40 hover:bg-slate-900/80 hover:shadow-lg hover:shadow-indigo-950/30"
            : ""
        }
        ${className}
      `}
    >
      {children}
    </div>
  );
}
