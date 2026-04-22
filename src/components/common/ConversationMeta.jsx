import { useState } from "react";
import {
  Calendar,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  RefreshCw,
  Trash2,
  AlertTriangle,
  KeyRound,
  Loader2,
} from "lucide-react";
import Card from "./Card";
import Button from "./Button";
import TagBadge, { CategoryBadge } from "./TagBadge";
import {
  formatFullDate,
  formatRelative,
  estimateReadTime,
} from "../../utils/format";

export default function ConversationMeta({
  conversation,
  onReanalyze,
  onDelete,
  hasKey,
  isAnalyzing,
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const c = conversation;

  const totalChars = (c.messages || []).reduce(
    (sum, m) => sum + (m.content?.length || 0),
    0,
  );

  return (
    <div className="space-y-4">
      {/* 카테고리 & 요약 */}
      <Card className="p-5">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-slate-100">AI 분석 결과</h3>
        </div>

        {c.is_analyzed ? (
          <div className="mt-4 space-y-3">
            {c.tag_category && (
              <div>
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  카테고리
                </div>
                <CategoryBadge category={c.tag_category} />
              </div>
            )}

            {c.summary && (
              <div>
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  한 줄 요약
                </div>
                <p className="text-xs leading-relaxed text-slate-200">
                  {c.summary}
                </p>
              </div>
            )}

            {c.tags && c.tags.length > 0 && (
              <div>
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  태그
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.tags.map((tag) => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      category={c.tag_category}
                      size="sm"
                    />
                  ))}
                </div>
              </div>
            )}

            {c.keywords && c.keywords.length > 0 && (
              <div>
                <div className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
                  키워드
                </div>
                <div className="flex flex-wrap gap-1">
                  {c.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {c.analyzed_at && (
              <div className="border-t border-slate-800 pt-3 text-[10px] text-slate-500">
                분석 시각: {formatRelative(c.analyzed_at)}
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed border-slate-800 bg-slate-900/40 p-4 text-center">
            <p className="text-xs text-slate-400">
              아직 분석되지 않은 대화예요.
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onReanalyze}
            disabled={!hasKey || isAnalyzing}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <RefreshCw className="h-3.5 w-3.5" />
                {c.is_analyzed ? "재분석" : "분석 실행"}
              </>
            )}
          </Button>
          {!hasKey && (
            <span className="flex items-center justify-center gap-1 text-[10px] text-amber-300">
              <KeyRound className="h-3 w-3" />
              API 키가 필요해요
            </span>
          )}
        </div>
      </Card>

      {/* 기본 메타 정보 */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-slate-100">대화 정보</h3>

        <dl className="mt-4 space-y-3 text-xs">
          <MetaRow
            icon={<Calendar className="h-3.5 w-3.5" />}
            label="작성 시각"
            value={formatFullDate(c.created_at)}
          />
          <MetaRow
            icon={<Clock className="h-3.5 w-3.5" />}
            label="경과 시간"
            value={formatRelative(c.created_at)}
          />
          <MetaRow
            icon={<MessageSquare className="h-3.5 w-3.5" />}
            label="메시지 수"
            value={`${c.message_count || c.messages?.length || 0}개`}
          />
          <MetaRow
            icon={<FileText className="h-3.5 w-3.5" />}
            label="총 글자 수"
            value={`${totalChars.toLocaleString()}자 (약 ${estimateReadTime(totalChars)} 분량)`}
          />
          {c.source_file && (
            <MetaRow
              icon={<FileText className="h-3.5 w-3.5" />}
              label="출처 파일"
              value={
                <span className="break-all text-[11px] text-slate-400">
                  {c.source_file}
                </span>
              }
            />
          )}
        </dl>
      </Card>

      {/* 위험 존 */}
      <Card className="border-rose-500/20 bg-rose-500/5 p-5">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-rose-400" />
          <h3 className="text-sm font-semibold text-rose-200">위험 구역</h3>
        </div>

        {!confirmDelete ? (
          <>
            <p className="mt-2 text-[11px] text-rose-200/70">
              삭제 시 이 대화와 모든 메시지, 유사도 관계가 즉시 제거돼요.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              className="mt-3 text-rose-300 hover:text-rose-200"
            >
              <Trash2 className="h-3.5 w-3.5" />이 대화 삭제
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-xs font-medium text-rose-100">
              정말 삭제할까요? 되돌릴 수 없어요.
            </p>
            <div className="mt-3 flex gap-2">
              <Button variant="danger" size="sm" onClick={onDelete}>
                <Trash2 className="h-3.5 w-3.5" />
                삭제 확정
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(false)}
              >
                취소
              </Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function MetaRow({ icon, label, value }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </dt>
      <dd className="mt-0.5 text-slate-200">{value}</dd>
    </div>
  );
}
