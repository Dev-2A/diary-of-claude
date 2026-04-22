/**
 * Diary of Claude — IndexedDB 스키마
 *
 * 테이블 구조:
 *  - conversations: 대화 메타 (id, 제목, 날짜, 태그, 요약 등)
 *  - messages:       대화 내 개별 메시지 (conversation_id로 연결)
 *  - tags:           태그 레지스트리 (이름, 카테고리, 사용 횟수)
 *  - settings:       key-value 설정 (API 키, 환경설정 등)
 *  - similarities:   대화 쌍 간 유사도 캐시 (a_id, b_id, score)
 */

export const DB_NAME = "DiaryOfClaudeDB";
export const DB_VERSION = 1;

export const SCHEMA = {
  conversations:
    "++id, uuid, title, created_at, updated_at, tag_category, source_file, *tags",
  messages: "++id, conversation_id, role, order_index, created_at",
  tags: "++id, &name, category, usage_count",
  settings: "&key",
  similarities: "[a_id+b_id], a_id, b_id, score",
};

// 대화 태그 카테고리 (사전 정의 — 자동 분류 시 이 중 하나로 귀속)
export const TAG_CATEGORIES = [
  "coding",
  "writing",
  "learning",
  "brainstorm",
  "debug",
  "design",
  "analysis",
  "personal",
];

// 메시지 역할
export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
};
