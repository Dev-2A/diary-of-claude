import { X, MessageSquare, ChevronRight } from "lucide-react";
import Card from "../common/Card";
import TagBadge, { CategoryBadge } from "../common/TagBadge";

export default function DayDetailPanel({
  date,
  conversations,
  onClose,
  onOpenConversation,
}) {
  const dateStr = date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  return (
    <Card className="border-indigo-500/30 bg-slate-900/80 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-300">
            선택된 날짜
          </p>
          <h3 className="mt-1 text-lg font-semibold text-slate-100">
            {dateStr}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">
            {conversations.length}개의 대화
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300"
          title="닫기"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {conversations.map((c) => (
          <li key={c.id}>
            <button
              onClick={() => onOpenConversation?.(c.id)}
              className="group w-full rounded-lg border border-slate-800 bg-slate-950/40 p-3 text-left transition-colors hover:border-indigo-500/40 hover:bg-slate-900/60"
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="truncate text-sm font-medium text-slate-100">
                      {c.title}
                    </h4>
                    {c.tag_category && (
                      <CategoryBadge category={c.tag_category} size="xs" />
                    )}
                  </div>

                  {c.summary && (
                    <p className="mt-1 line-clamp-1 text-[11px] text-slate-400">
                      {c.summary}
                    </p>
                  )}

                  {c.tags && c.tags.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {c.tags.slice(0, 3).map((tag) => (
                        <TagBadge
                          key={tag}
                          tag={tag}
                          category={c.tag_category}
                          size="xs"
                        />
                      ))}
                    </div>
                  )}
                </div>
                <ChevronRight className="mt-1 h-3.5 w-3.5 shrink-0 text-slate-600 transition-colors group-hover:text-indigo-400" />
              </div>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
