import { MessageSquare, Calendar, Sparkles } from "lucide-react";
import Card from "./Card";
import TagBadge, { CategoryBadge } from "./TagBadge";

export default function ConversationCard({ conversation, onClick }) {
  const c = conversation;

  return (
    <Card className="flex h-full flex-col p-4" hoverable onClick={onClick}>
      <div className="flex items-start gap-2">
        <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-indigo-400" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="min-w-0 flex-1 truncate font-medium text-slate-100">
              {c.title}
            </h4>
            {c.tag_category ? (
              <CategoryBadge category={c.tag_category} size="xs" />
            ) : (
              <span className="shrink-0 whitespace-nowrap rounded-full border border-slate-700 bg-slate-800/40 px-2 py-0.5 text-[10px] text-slate-500">
                미분석
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(c.created_at).toLocaleDateString("ko-KR")}
            </span>
            <span>· {c.message_count}개 메시지</span>
            {c.is_analyzed && (
              <span className="flex items-center gap-0.5 text-purple-400/70">
                <Sparkles className="h-2.5 w-2.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 min-h-0 flex-1">
        {c.summary ? (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-300">
            {c.summary}
          </p>
        ) : c.raw_preview ? (
          <p className="line-clamp-2 text-[11px] leading-relaxed text-slate-400">
            {c.raw_preview}
          </p>
        ) : null}
      </div>

      {c.tags && c.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {c.tags.slice(0, 4).map((tag) => (
            <TagBadge key={tag} tag={tag} category={c.tag_category} size="xs" />
          ))}
          {c.tags.length > 4 && (
            <span className="text-[10px] text-slate-500">
              +{c.tags.length - 4}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
