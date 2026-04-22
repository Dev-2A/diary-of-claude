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
        rounded-xl border border-slate-800 bg-slate-900/60 backdrop-blur-sm
        ${hoverable ? "hover:border-indigo-500/40 hover:bg-slate-900/80 cursor-pointer transition-all" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
