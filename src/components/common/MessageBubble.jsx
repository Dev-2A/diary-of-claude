import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { User, Sparkles } from "lucide-react";
import { MESSAGE_ROLES } from "../../db/schema";

export default function MessageBubble({ message, index }) {
  const isUser = message.role === MESSAGE_ROLES.USER;

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row" : "flex-row"}`}>
      {/* 아바타 */}
      <div
        className={`
        flex h-8 w-8 shrink-0 items-center justify-center rounded-lg
        ${
          isUser
            ? "bg-slate-800 text-slate-300"
            : "bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-900/30"
        }
      `}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>

      {/* 메시지 본문 */}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span
            className={`text-xs font-semibold ${isUser ? "text-slate-200" : "text-indigo-300"}`}
          >
            {isUser ? "나" : "Claude"}
          </span>
          <span className="text-[10px] text-slate-600">#{index + 1}</span>
        </div>

        <div
          className={`
          mt-1.5 rounded-xl border px-4 py-3
          ${
            isUser
              ? "border-slate-800 bg-slate-900/60"
              : "border-indigo-500/20 bg-indigo-500/5"
          }
        `}
        >
          <div className="message-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || ""}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}
