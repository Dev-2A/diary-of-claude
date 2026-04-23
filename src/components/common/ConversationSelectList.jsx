import { Calendar, MessageSquare, CheckSquare, Square } from "lucide-react";
import { CategoryBadge } from "./TagBadge";

export default function ConversationSelectList({
  conversations,
  selectedIds,
  onToggle,
  onSelectAll,
  onDeselectAll,
}) {
  const allSelected =
    conversations.length > 0 && selectedIds.size === conversations.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">
          <span className="font-semibold text-slate-200">
            {selectedIds.size}
          </span>
          <span className="mx-1">/</span>
          <span>{conversations.length}</span>개 선택
        </span>
        <button
          onClick={() => (allSelected ? onDeselectAll() : onSelectAll())}
          className="text-indigo-300 hover:text-indigo-200"
        >
          {allSelected ? "전체 해제" : "전체 선택"}
        </button>
      </div>

      <ul className="max-h-[420px] space-y-1.5 overflow-auto rounded-lg border border-slate-800 bg-slate-950/40 p-2">
        {conversations.length === 0 ? (
          <li className="py-8 text-center text-xs text-slate-500">
            조건에 맞는 대화가 없어요
          </li>
        ) : (
          conversations.map((c) => {
            const isSelected = selectedIds.has(c.id);
            return (
              <li key={c.id}>
                <button
                  onClick={() => onToggle(c.id)}
                  className={`
                    flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left transition-colors
                    ${
                      isSelected
                        ? "bg-indigo-500/10 text-slate-100"
                        : "text-slate-300 hover:bg-slate-900/60"
                    }
                  `}
                >
                  {isSelected ? (
                    <CheckSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                  ) : (
                    <Square className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-600" />
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="truncate text-xs font-medium">
                        {c.title}
                      </span>
                      {c.tag_category && (
                        <CategoryBadge category={c.tag_category} size="xs" />
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-0.5">
                        <Calendar className="h-2.5 w-2.5" />
                        {new Date(c.created_at).toLocaleDateString("ko-KR")}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageSquare className="h-2.5 w-2.5" />
                        {c.message_count || 0}
                      </span>
                    </div>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
