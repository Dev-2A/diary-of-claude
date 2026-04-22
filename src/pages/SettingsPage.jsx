import { useState } from "react";
import {
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Loader2,
  Shield,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Cpu,
} from "lucide-react";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { useApiKey } from "../hooks/useApiKey";
import { testConnection, maskApiKey } from "../services/anthropicClient";
import { CLAUDE_MODELS } from "../constants/models";

export default function SettingsPage() {
  const { apiKey, model, loading, saveApiKey, saveModel, clearApiKey, hasKey } =
    useApiKey();

  const [editMode, setEditMode] = useState(false);
  const [inputKey, setInputKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testState, setTestState] = useState(null); // null | 'loading' | { ok, ... }

  const handleStartEdit = () => {
    setInputKey("");
    setEditMode(true);
    setTestState(null);
  };

  const handleCancelEdit = () => {
    setInputKey("");
    setEditMode(false);
    setTestState(null);
  };

  const handleSave = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) return;
    await saveApiKey(trimmed);
    setEditMode(false);
    setTestState(null);
  };

  const handleTest = async () => {
    const keyToTest = editMode ? inputKey.trim() : apiKey;
    if (!keyToTest) return;
    setTestState("loading");
    const result = await testConnection(keyToTest, model);
    setTestState(result);
  };

  const handleClear = async () => {
    if (
      !confirm(
        "저장된 API 키를 삭제할까요? 분석 기능을 다시 사용하려면 재등록해야 해요.",
      )
    )
      return;
    await clearApiKey();
    setTestState(null);
  };

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">설정</h2>
        <p className="mt-1 text-sm text-slate-400">
          자동 태깅·요약 등 분석 기능을 사용하려면 본인의 Anthropic API 키가
          필요해요 (BYOK).
        </p>
      </div>

      {/* 보안 고지 */}
      <Card className="border-emerald-500/20 bg-emerald-500/5 p-5">
        <div className="flex items-start gap-3">
          <Shield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
          <div className="text-sm">
            <p className="font-semibold text-emerald-200">💙 완전 로컬 처리</p>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-emerald-100/80">
              <li>· API 키는 브라우저의 IndexedDB에만 저장돼요.</li>
              <li>· 분석 요청은 브라우저에서 Anthropic으로 직접 전송돼요.</li>
              <li>
                · 원본 대화 데이터는 이 앱 외부 어디로도 나가지 않아요 (분석
                호출 제외).
              </li>
              <li>· 공용 PC에서는 사용 후 키를 꼭 삭제해주세요.</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* API 키 입력 */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-indigo-400" />
          <h3 className="font-semibold text-slate-100">Anthropic API 키</h3>
        </div>

        {/* 조회 모드 */}
        {!editMode && (
          <div className="mt-4 space-y-4">
            {hasKey ? (
              <div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3">
                <div
                  className={`h-2 w-2 rounded-full ${hasKey ? "bg-emerald-400" : "bg-slate-600"}`}
                />
                <code className="flex-1 text-sm text-slate-200">
                  {showKey ? apiKey : maskApiKey(apiKey)}
                </code>
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="text-slate-400 hover:text-slate-200"
                  title={showKey ? "숨기기" : "표시"}
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-lg border border-dashed border-amber-500/30 bg-amber-500/5 px-4 py-3">
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                <p className="text-sm text-amber-200">
                  등록된 키가 없어요. 분석 기능을 쓰려면 키를 등록해주세요.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleStartEdit} variant="primary">
                {hasKey ? "키 변경" : "키 등록"}
              </Button>
              {hasKey && (
                <>
                  <Button
                    onClick={handleTest}
                    variant="secondary"
                    disabled={testState === "loading"}
                  >
                    {testState === "loading" && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    연결 테스트
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="ghost"
                    className="text-rose-300 hover:text-rose-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    삭제
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 편집 모드 */}
        {editMode && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-400">
                sk-ant- 로 시작하는 Anthropic API 키
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={inputKey}
                  onChange={(e) => setInputKey(e.target.value)}
                  placeholder="sk-ant-api03-xxxxxxxxxxxx..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-4 py-2.5 pr-10 font-mono text-sm text-slate-100 placeholder:text-slate-600 focus:border-indigo-500 focus:outline-none"
                  autoComplete="off"
                  spellCheck="false"
                />
                <button
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  type="button"
                >
                  {showKey ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <a
                href="https://console.anthropic.com/settings/keys"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-[11px] text-indigo-300 hover:text-indigo-200"
              >
                <ExternalLink className="h-3 w-3" />
                Anthropic Console에서 키 발급받기
              </a>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={!inputKey.trim()}>
                저장
              </Button>
              <Button
                onClick={handleTest}
                variant="secondary"
                disabled={!inputKey.trim() || testState === "loading"}
              >
                {testState === "loading" && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                저장 전 연결 테스트
              </Button>
              <Button onClick={handleCancelEdit} variant="ghost">
                취소
              </Button>
            </div>
          </div>
        )}

        {/* 테스트 결과 */}
        {testState && testState !== "loading" && (
          <div
            className={`
            mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-xs
            ${
              testState.ok
                ? "border border-emerald-500/30 bg-emerald-500/5 text-emerald-200"
                : "border border-rose-500/30 bg-rose-500/5 text-rose-200"
            }
          `}
          >
            {testState.ok ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
            )}
            <div>
              {testState.ok ? (
                <>
                  <p className="font-semibold">연결 성공</p>
                  <p className="mt-0.5 opacity-80">모델: {testState.model}</p>
                </>
              ) : (
                <>
                  <p className="font-semibold">연결 실패</p>
                  <p className="mt-0.5 opacity-80">{testState.error}</p>
                </>
              )}
            </div>
          </div>
        )}
      </Card>

      {/* 모델 선택 */}
      <Card className="p-6">
        <div className="flex items-center gap-2">
          <Cpu className="h-4 w-4 text-purple-400" />
          <h3 className="font-semibold text-slate-100">분석 모델</h3>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          자동 태깅/요약에 사용할 Claude 모델이에요. 대량 분석이라면 Haiku가
          속도·비용 면에서 유리해요.
        </p>

        <div className="mt-4 space-y-2">
          {CLAUDE_MODELS.map((m) => {
            const selected = model === m.id;
            return (
              <button
                key={m.id}
                onClick={() => saveModel(m.id)}
                className={`
                  w-full rounded-lg border px-4 py-3 text-left transition-all
                  ${
                    selected
                      ? "border-indigo-500/50 bg-indigo-500/10 shadow-inner shadow-indigo-500/5"
                      : "border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-semibold ${selected ? "text-indigo-200" : "text-slate-200"}`}
                    >
                      {m.name}
                    </span>
                    {m.recommended && (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        추천
                      </span>
                    )}
                  </div>
                  {selected && (
                    <CheckCircle2 className="h-4 w-4 text-indigo-400" />
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{m.description}</p>
                <code className="mt-1 block text-[10px] text-slate-600">
                  {m.id}
                </code>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
