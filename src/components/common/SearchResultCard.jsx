import { Calendar, MessageSquare } from "lucide-react";
import Card from "./Card";
import HighlightedText from "./HighlightedText";
import TagBadge, { CategoryBadge } from "./TagBadge";

export default function SearchResultCard({ conversation, keyword, onClick }) {
  const c = conversation;

  return (
    <Card className="p-4" hoverable onClick={onClick}>
      <div className="flex items-start gap-2">
        <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-indigo-400" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h4 className="min-w-0 flex-1 truncate font-medium text-slate-100">
              <HighlightedText text={c.title} keyword={keyword} />
            </h4>
            {c.tag_category && (
              <CategoryBadge category={c.tag_category} size="xs" />
            )}
          </div>

          <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(c.created_at).toLocaleDateString("ko-KR")}
            </span>
            <span>· {c.message_count}개 메시지</span>
          </div>

          {c.summary && (
            <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-slate-300">
              <HighlightedText text={c.summary} keyword={keyword} />
            </p>
          )}

          {c.tags && c.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {c.tags.slice(0, 5).map((tag) => (
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
      </div>
    </Card>
  );
}
