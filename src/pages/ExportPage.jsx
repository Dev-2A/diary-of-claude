import { useEffect, useMemo, useState } from "react";
import { Download, Filter, AlertTriangle } from "lucide-react";
import Card from "../components/common/Card";
import SearchForm, { EMPTY_QUERY } from "../components/common/SearchForm";
import ExportFormatSelector from "../components/common/ExportFormatSelector";
import ExportPreview from "../components/common/ExportPreview";
import ConversationSelectList from "../components/common/ConversationSelectList";
import { searchConversations } from "../services/searchEngine";
import {
  exportConversations,
  downloadAsFile,
  copyToClipboard,
} from "../services/exportService";

export default function ExportPage() {
  const [query, setQuery] = useState(EMPTY_QUERY);
  const [filtered, setFiltered] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [format, setFormat] = useState("markdown");
  const [groupTitle, setGroupTitle] = useState("");
  const [preview, setPreview] = useState(null); // { filename, content, mime }
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // 검색
  useEffect(() => {
    let mounted = true;
    searchConversations(query).then((res) => {
      if (!mounted) return;
      setFiltered(res);
      // 선택 목록 정리 — 필터에서 빠진 ID 제거
      setSelectedIds((prev) => {
        const next = new Set();
        const validIds = new Set(res.map((c) => c.id));
        for (const id of prev) {
          if (validIds.has(id)) next.add(id);
        }
        return next;
      });
    });
    return () => {
      mounted = false;
    };
  }, [query]);

  // 미리보기 자동 생성
  useEffect(() => {
    if (selectedIds.size === 0) {
      setPreview(null);
      setError(null);
      return;
    }

    let mounted = true;
    setIsGenerating(true);
    setError(null);

    const ids = Array.from(selectedIds);
    exportConversations(ids, format, {
      groupTitle: groupTitle.trim() || undefined,
    })
      .then((res) => {
        if (!mounted) return;
        setPreview(res);
        setIsGenerating(false);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "미리보기 생성 실패");
        setPreview(null);
        setIsGenerating(false);
      });

    return () => {
      mounted = false;
    };
  }, [selectedIds, format, groupTitle]);

  const handleToggle = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filtered.map((c) => c.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleDownload = () => {
    if (preview) {
      downloadAsFile(preview.filename, preview.content, preview.mime);
    }
  };

  const handleCopy = async () => {
    if (preview) {
      return await copyToClipboard(preview.content);
    }
    return false;
  };

  const totalChars = useMemo(() => {
    let total = 0;
    for (const id of selectedIds) {
      const conv = filtered.find((c) => c.id === id);
      if (conv) total += conv.raw_preview?.length || 0;
    }
    return total;
  }, [selectedIds, filtered]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">내보내기</h2>
        <p className="mt-1 text-sm text-slate-400">
          조건으로 대화를 묶고, Markdown · Notion · GitHub Issue 등 원하는
          포맷으로 내보내요.
        </p>
      </div>

      {/* 1단계: 필터 */}
      <Card className="space-y-4 p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
          <Filter className="h-4 w-4 text-indigo-400" />
          1. 대화 필터링
        </h3>
        <p className="text-[11px] text-slate-500">
          내보낼 대화를 좁혀요. 검색 페이지와 동일한 조건을 사용해요.
        </p>
        <SearchForm
          query={query}
          onChange={setQuery}
          onReset={() => setQuery(EMPTY_QUERY)}
        />
      </Card>

      {/* 2단계: 선택 + 포맷 */}
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="space-y-4 p-5">
          <h3 className="text-sm font-semibold text-slate-100">2. 대화 선택</h3>
          <ConversationSelectList
            conversations={filtered}
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onSelectAll={handleSelectAll}
            onDeselectAll={handleDeselectAll}
          />
        </Card>

        <Card className="space-y-4 p-5">
          <h3 className="text-sm font-semibold text-slate-100">3. 옵션</h3>

          <div>
            <label className="mb-2 block text-[10px] font-medium uppercase tracking-wider text-slate-500">
              모음 제목 (선택)
            </label>
            <input
              type="text"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              placeholder="예: 2026년 1분기 디버깅 모음"
              className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
            />
            <p className="mt-1 text-[10px] text-slate-500">
              내보낸 문서 최상단에 들어갈 제목이에요.
            </p>
          </div>

          <ExportFormatSelector value={format} onChange={setFormat} />
        </Card>
      </div>

      {/* 3단계: 미리보기 */}
      <Card className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-100">
            <Download className="h-4 w-4 text-emerald-400" />
            4. 미리보기 & 다운로드
          </h3>
          {selectedIds.size > 0 && (
            <span className="text-[11px] text-slate-500">
              {selectedIds.size}개 대화 선택됨
            </span>
          )}
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-500/30 bg-rose-500/5 p-3 text-xs text-rose-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <ExportPreview
          content={preview?.content}
          filename={preview?.filename}
          isGenerating={isGenerating}
          onDownload={handleDownload}
          onCopy={handleCopy}
        />
      </Card>
    </div>
  );
}
