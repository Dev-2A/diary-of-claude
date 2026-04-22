import { useEffect, useMemo, useState } from "react";
import { BarChart3, Calendar, TrendingUp } from "lucide-react";
import Card from "../components/common/Card";
import ActivityHeatmap from "../components/charts/ActivityHeatmap";
import YearSummary from "../components/charts/YearSummary";
import DayDetailPanel from "../components/charts/DayDetailPanel";
import CategoryStreamChart from "../components/charts/CategoryStreamChart";
import CategoryRankingList from "../components/charts/CategoryRankingList";
import { getAllConversations } from "../db";
import { getAvailableYears, summarizeYear } from "../utils/dateAggregation";
import { aggregateCategoryByMonth } from "../utils/categoryTrend";

export default function StatsPage({ onOpenConversation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    let mounted = true;
    getAllConversations().then((list) => {
      if (!mounted) return;
      setConversations(list);
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const availableYears = useMemo(
    () => getAvailableYears(conversations),
    [conversations],
  );

  const yearSummary = useMemo(
    () => summarizeYear(conversations, year),
    [conversations, year],
  );

  // 스트림그래프는 전체 기간 기준 (연도 필터와 별개)
  const categoryTrend = useMemo(
    () => aggregateCategoryByMonth(conversations),
    [conversations],
  );

  const handleDayClick = (date, convs) => {
    setSelectedDay({ date, conversations: convs });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-500">
        로드 중...
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">통계</h2>
          <p className="mt-1 text-sm text-slate-400">
            활동 히트맵, 월별 관심사 변화, 대화 간 유사도 링크를 여기에서 확인할
            수 있어요.
          </p>
        </div>
        <Card className="p-12 text-center">
          <BarChart3 className="mx-auto h-10 w-10 text-slate-700" />
          <p className="mt-3 text-sm text-slate-400">
            아직 분석할 대화가 없어요. 아카이브 페이지에서 파일을 먼저
            업로드해주세요.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">통계</h2>
          <p className="mt-1 text-sm text-slate-400">
            Claude와 나눈 대화의 시계열 패턴과 주제 변화를 한눈에 확인해요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <select
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setSelectedDay(null);
            }}
            className="rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-1.5 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none"
          >
            {availableYears.map((y) => (
              <option key={y} value={y} className="bg-slate-900">
                {y}년
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 연도 요약 */}
      <YearSummary summary={yearSummary} year={year} />

      {/* 활동 히트맵 */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-100">
              활동 히트맵
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              날짜별 대화 밀도 · 셀을 클릭하면 그 날의 대화 목록을 볼 수 있어요
            </p>
          </div>
          {yearSummary.maxDay.date && (
            <div className="hidden text-right text-[11px] text-slate-400 sm:block">
              가장 활발했던 날:{" "}
              <span className="font-medium text-indigo-300">
                {yearSummary.maxDay.date}
              </span>
              <span className="ml-1 text-slate-500">
                · {yearSummary.maxDay.count}개
              </span>
            </div>
          )}
        </div>

        <ActivityHeatmap
          conversations={conversations}
          year={year}
          onDayClick={handleDayClick}
        />
      </Card>

      {/* 선택된 날짜 상세 */}
      {selectedDay && (
        <DayDetailPanel
          date={selectedDay.date}
          conversations={selectedDay.conversations}
          onClose={() => setSelectedDay(null)}
          onOpenConversation={onOpenConversation}
        />
      )}

      {/* 월별 관심사 변화 */}
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              월별 관심사 변화
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              시간에 따른 카테고리별 대화량의 흐름 · 분석된 대화만 표시 · 스트림
              위에서 움직여보세요
            </p>
          </div>
        </div>

        {categoryTrend.empty ? (
          <div className="rounded-lg border border-dashed border-slate-800 bg-slate-900/30 p-8 text-center">
            <p className="text-sm text-slate-400">
              아직 분석된 대화가 없어요. 아카이브에서{" "}
              <span className="text-indigo-300">전체 분석 시작</span>을
              눌러주세요.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[1fr_240px]">
            <div className="min-w-0">
              <CategoryStreamChart
                series={categoryTrend.series}
                categories={categoryTrend.categories}
              />
            </div>
            <div>
              <CategoryRankingList
                series={categoryTrend.series}
                categories={categoryTrend.categories}
              />
            </div>
          </div>
        )}
      </Card>

      {/* 다음 단계 예고 */}
      <Card className="border-dashed border-slate-800 bg-slate-900/30 p-6">
        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-400">곧 추가될 시각화</span>
          {" · "}대화 간 유사도 링크 (포스 그래프)
        </p>
      </Card>
    </div>
  );
}
