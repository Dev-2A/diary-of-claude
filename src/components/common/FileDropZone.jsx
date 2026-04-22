import { useCallback, useRef, useState } from "react";
import { Upload, FileText } from "lucide-react";

export default function FileDropzone({ onFiles, disabled = false }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
      const files = e.dataTransfer?.files;
      if (files && files.length > 0) onFiles(files);
    },
    [disabled, onFiles],
  );

  const handleDragOver = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragging(true);
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  const handleChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) onFiles(files);
    e.target.value = "";
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`
        relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-12 transition-all
        ${
          disabled
            ? "cursor-not-allowed border-slate-800 bg-slate-900/30 opacity-60"
            : isDragging
              ? "cursor-pointer border-indigo-400 bg-indigo-500/10 shadow-lg shadow-indigo-900/30"
              : "cursor-pointer border-slate-700 bg-slate-900/40 hover:border-indigo-500/60 hover:bg-slate-900/60"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".md,.markdown,.json,.txt"
        multiple
        onChange={handleChange}
        className="hidden"
        disabled={disabled}
      />

      <div
        className={`
        flex h-14 w-14 items-center justify-center rounded-full transition-colors
        ${isDragging ? "bg-indigo-500/20 text-indigo-300" : "bg-slate-800 text-slate-400"}
      `}
      >
        <Upload className="h-6 w-6" />
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-slate-100">
          {isDragging ? "놓으면 업로드됩니다" : "파일을 끌어다 놓거나 클릭"}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          .md · .markdown · .json · .txt · 여러 파일 동시 업로드 가능
        </p>
      </div>

      <div className="mt-2 flex items-center gap-4 text-[11px] text-slate-500">
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          Claude 공식 JSON export
        </div>
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          마크다운 대화 아카이브
        </div>
      </div>
    </div>
  );
}
