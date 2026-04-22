import { Calendar, Flame, Trophy, Zap } from "lucide-react";

export default function YearSummary({ summary, year }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SummaryCard
        icon={<Calendar className="h-3.5 w-3.5 text-indigo-400" />}
        label={`${year}년 전체 대화`}
        value={summary.total.toLocaleString()}
        suffix="개"
      />
      <SummaryCard
        icon={<Zap className="h-3.5 w-3.5 text-amber-400" />}
        label="활동한 날"
        value={summary.activeDays.toLocaleString()}
        suffix="일"
      />
      <SummaryCard
        icon={<Flame className="h-3.5 w-3.5 text-rose-400" />}
        label="현재 연속 일수"
        value={summary.currentStreak.toLocaleString()}
        suffix="일"
      />
      <SummaryCard
        icon={<Trophy className="h-3.5 w-3.5 text-emerald-400" />}
        label="최장 연속 기록"
        value={summary.longestStreak.toLocaleString()}
        suffix="일"
      />
    </div>
  );
}

function SummaryCard({ icon, label, value, suffix }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-100">{value}</span>
        <span className="text-xs text-slate-500">{suffix}</span>
      </div>
    </div>
  );
}
