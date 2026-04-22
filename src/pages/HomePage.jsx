import Card from "../components/common/Card";
import { Upload, Library, BarChart3 } from "lucide-react";

export default function HomePage({ onNavigate }) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-100">
          Claude와 나눈 대화를 <span className="text-indigo-400">한눈에</span>
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Claude export 파일을 업로드하면 자동으로 태깅·분류·요약하고, 시계열로
          활동 패턴을 시각화해요.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6" hoverable onClick={() => onNavigate("archive")}>
          <Upload className="h-6 w-6 text-indigo-400" />
          <h3 className="mt-4 font-semibold text-slate-100">업로드 & 분석</h3>
          <p className="mt-1 text-xs text-slate-400">
            .md / .json export 파일을 끌어다 놓으면 시작돼요.
          </p>
        </Card>

        <Card className="p-6" hoverable onClick={() => onNavigate("archive")}>
          <Library className="h-6 w-6 text-purple-400" />
          <h3 className="mt-4 font-semibold text-slate-100">아카이브 탐색</h3>
          <p className="mt-1 text-xs text-slate-400">
            태그·기간·키워드로 과거 대화를 빠르게 찾아요.
          </p>
        </Card>

        <Card className="p-6" hoverable onClick={() => onNavigate("stats")}>
          <BarChart3 className="h-6 w-6 text-emerald-400" />
          <h3 className="mt-4 font-semibold text-slate-100">메타 분석</h3>
          <p className="mt-1 text-xs text-slate-400">
            활동 히트맵, 월별 관심사 변화, 대화 간 유사도 링크.
          </p>
        </Card>
      </div>
    </div>
  );
}
