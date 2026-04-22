/**
 * 통합 검색 엔진
 *
 * 지원 조건:
 *  - 키워드 (제목/요약/메시지/태그/키워드 전반 검색)
 *  - 카테고리 (다중 선택)
 *  - 태그 (다중 선택, AND/OR)
 *  - 기간 (시작~종료 날짜)
 *  - 분석 상태 (전체/분석됨/미분석)
 *  - 메시지 수 범위
 */

import { db } from "../db";

export const TAG_MATCH_MODE = {
  ANY: "any", // OR - 하나라도 일치
  ALL: "all", // AND - 모두 일치
};

/**
 * 메시지 본문까지 검색 대상에 포함할지에 따라 메시지 인덱스 빌드
 * 비용이 크므로 옵션으로 분리
 */
export async function buildMessageIndex() {
  const messages = await db.messages.toArray();
  const map = new Map(); // conversation_id → 합쳐진 본문 (소문자)
  for (const m of messages) {
    const text = (m.content || "").toLowerCase();
    if (!text) continue;
    const prev = map.get(m.conversation_id) || "";
    map.set(m.conversation_id, prev + " " + text);
  }
  return map;
}

/**
 * 단일 대화에 대해 검색 조건을 적용
 */
function matchesQuery(conv, query, messageIndex) {
  // 1. 키워드 (메타 + 옵션으로 메시지 본문)
  if (query.keyword && query.keyword.trim()) {
    const q = query.keyword.trim().toLowerCase();
    const haystack = [
      conv.title,
      conv.summary,
      conv.raw_preview,
      ...(conv.tags || []),
      ...(conv.keywords || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    let found = haystack.includes(q);

    // 메시지 본문 검색 모드
    if (!found && query.searchInMessages && messageIndex) {
      const messageBody = messageIndex.get(conv.id);
      if (messageBody && messageBody.includes(q)) {
        found = true;
      }
    }
    if (!found) return false;
  }

  // 2. 카테고리 (다중 OR)
  if (query.categories && query.categories.length > 0) {
    if (!conv.tag_category || !query.categories.includes(conv.tag_category)) {
      return false;
    }
  }

  // 3. 태그 (AND/OR)
  if (query.tags && query.tags.length > 0) {
    const convTags = (conv.tags || []).map((t) => t.toLowerCase());
    const queryTags = query.tags.map((t) => t.toLowerCase());
    if (query.tagMatchMode === TAG_MATCH_MODE.ALL) {
      if (!queryTags.every((qt) => convTags.includes(qt))) return false;
    } else {
      if (!queryTags.some((qt) => convTags.includes(qt))) return false;
    }
  }

  // 4. 기간
  if (query.startDate || query.endDate) {
    const created = new Date(conv.created_at).getTime();
    if (isNaN(created)) return false;
    if (query.startDate) {
      const start = new Date(query.startDate + "T00:00:00").getTime();
      if (created < start) return false;
    }
    if (query.endDate) {
      const end = new Date(query.endDate + "T23:59:59").getTime();
      if (created > end) return false;
    }
  }

  // 5. 분석 상태
  if (query.analyzedFilter === "analyzed" && !conv.is_analyzed) return false;
  if (query.analyzedFilter === "unanalyzed" && conv.is_analyzed) return false;

  // 6. 메시지 수 범위
  const msgCount = conv.message_count || 0;
  if (query.minMessages != null && msgCount < query.minMessages) return false;
  if (query.maxMessages != null && msgCount > query.maxMessages) return false;

  return true;
}

/**
 * 메인 검색 API
 */
export async function searchConversations(query) {
  const conversations = await db.conversations.toArray();

  let messageIndex = null;
  if (query.searchInMessages && query.keyword?.trim()) {
    messageIndex = await buildMessageIndex();
  }

  const results = conversations.filter((c) =>
    matchesQuery(c, query, messageIndex),
  );

  // 정렬 (최신순 기본)
  results.sort((a, b) => {
    const av = new Date(a.created_at).getTime() || 0;
    const bv = new Date(b.created_at).getTime() || 0;
    return bv - av;
  });

  return results;
}

/**
 * 검색어 하이라이트용 — 텍스트에서 키워드 위치를 찾아 split
 * @returns {Array<{ text: string, highlight: boolean }>}
 */
export function splitForHighlight(text, keyword) {
  if (!text || !keyword || !keyword.trim()) {
    return [{ text: text || "", highlight: false }];
  }
  const k = keyword.trim();
  const parts = [];
  const regex = new RegExp(`(${escapeRegex(k)})`, "gi");
  const tokens = text.split(regex);
  for (const tok of tokens) {
    if (!tok) continue;
    parts.push({
      text: tok,
      highlight: tok.toLowerCase() === k.toLowerCase(),
    });
  }
  return parts;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
