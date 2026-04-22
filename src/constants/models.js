/**
 * Claude 모델 목록 (Claude 4.x 세대)
 */
export const CLAUDE_MODELS = [
  {
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    description: "가장 강력한 최신 모델 — 복잡한 분석·요약에 적합",
    tier: "opus",
  },
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    description: "이전 세대 최상위 모델",
    tier: "opus",
  },
  {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    description: "성능과 속도의 균형 — 기본 추천",
    tier: "sonnet",
    recommended: true,
  },
  {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    description: "가장 빠르고 저렴 — 대량 태깅에 유리",
    tier: "haiku",
  },
];

export const DEFAULT_MODEL_ID = "claude-sonnet-4-6";

export const getModelById = (id) =>
  CLAUDE_MODELS.find((m) => m.id === id) ||
  CLAUDE_MODELS.find((m) => m.recommended);
