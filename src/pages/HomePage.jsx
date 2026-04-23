import Card from "../components/common/Card";
import {
  Upload,
  Library,
  BarChart3,
  MessageSquare,
  Tag,
  Database,
  Sparkles,
  Shield,
  Search,
  Download,
} from "lucide-react";
import { useDatabaseStats } from "../hooks/useDatabase";

export default function HomePage({ onNavigate }) {
  const { stats, loading } = useDatabaseStats();

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 히어로 */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/80 via-indigo-950/30 to-purple-950/30 p-8 sm:p-10">
        <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium text-indigo-300">
            <Sparkles className="h-3 w-3" />
            로컬 아카이브 & 메타 분석
          </div>
          <h2 className="mt-4 text-3xl font-bold text-slate-100 sm:text-4xl">
            Claude와 나눈 대화를{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              한눈에
            </span>
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-400">
            Claude export 파일을 업로드하면 자동으로 태깅·분류·요약하고,
            시계열로 활동 패턴과 관심사 변화를 시각화해요. 모든 데이터는
            브라우저 안에서만 처리돼요.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={() => onNavigate("archive")}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-900/30 transition-all hover:bg-indigo-500 active:scale-95"
            >
              <Upload className="mr-1.5 inline h-4 w-4" />
              파일 업로드하기
            </button>
            <button
              onClick={() => onNavigate("stats")}
              className="rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800"
            >
              <BarChart3 className="mr-1.5 inline h-4 w-4" />
              통계 보기
            </button>
          </div>
        </div>
      </div>

      {/* DB 통계 */}
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<MessageSquare className="h-4 w-4 text-indigo-400" />}
          label="저장된 대화"
          value={loading ? "…" : stats.conversationCount.toLocaleString()}
        />
        <StatCard
          icon={<Database className="h-4 w-4 text-purple-400" />}
          label="메시지"
          value={loading ? "…" : stats.messageCount.toLocaleString()}
        />
        <StatCard
          icon={<Tag className="h-4 w-4 text-emerald-400" />}
          label="등록된 태그"
          value={loading ? "…" : stats.tagCount.toLocaleString()}
        />
      </div>

      {/* 기능 카드 */}
      <div>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">
          주요 기능
        </h3>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Upload className="h-5 w-5 text-indigo-400" />}
            title="업로드 & 분석"
            description=".md / .json export 파일을 끌어다 놓으면 자동 태깅·요약이 시작돼요."
            onClick={() => onNavigate("archive")}
          />
          <FeatureCard
            icon={<Library className="h-5 w-5 text-purple-400" />}
            title="아카이브 탐색"
            description="카테고리·태그·기간으로 대화를 정리하고 찾을 수 있어요."
            onClick={() => onNavigate("archive")}
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5 text-emerald-400" />}
            title="메타 분석"
            description="활동 히트맵, 월별 관심사 변화, 대화 간 유사도 링크를 확인해요."
            onClick={() => onNavigate("stats")}
          />
          <FeatureCard
            icon={<Search className="h-5 w-5 text-cyan-400" />}
            title="통합 검색"
            description="키워드·카테고리·태그·기간·분석 상태 등 다중 조건 검색."
            onClick={() => onNavigate("search")}
          />
          <FeatureCard
            icon={<Download className="h-5 w-5 text-amber-400" />}
            title="내보내기"
            description="Markdown · Notion · GitHub Issue 등 원하는 포맷으로 묶어 내보내요."
            onClick={() => onNavigate("export")}
          />
          <FeatureCard
            icon={<Shield className="h-5 w-5 text-rose-400" />}
            title="완전 로컬 처리"
            description="API 키와 원본 데이터가 외부로 전송되지 않아요. BYOK 방식."
            onClick={() => onNavigate("settings")}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </div>
      <div className="mt-3 text-3xl font-bold tabular-nums text-slate-100">
        {value}
      </div>
    </Card>
  );
}

function FeatureCard({ icon, title, description, onClick }) {
  return (
    <Card className="p-5" hoverable onClick={onClick}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/80">
        {icon}
      </div>
      <h4 className="mt-4 font-semibold text-slate-100">{title}</h4>
      <p className="mt-1 text-xs leading-relaxed text-slate-400">
        {description}
      </p>
    </Card>
  );
}
