import { getClient } from "./anthropicClient";
import {
  ANALYSIS_SYSTEM_PROMPT,
  buildUserPrompt,
  isValidCategory,
} from "./prompts";
import {
  getUnanalyzedConversations,
  getConversationWithMessages,
  updateConversation,
} from "../db/conversations";
import { upsertTag } from "../db/tags";

/**
 * 단일 대화 분석 — Claude에 호출 후 결과 반환
 * @returns {Promise<{ category, tags, summary, keywords }>}
 */
export async function analyzeConversation(conversationId) {
  const session = await getClient();
  if (!session)
    throw new Error(
      "API 키가 설정되지 않았어요. 설정 페이지에서 먼저 등록해주세요.",
    );

  const conversation = await getConversationWithMessages(conversationId);
  if (!conversation)
    throw new Error(`대화 #${conversationId}를 찾을 수 없어요.`);
  if (!conversation.messages || conversation.messages.length === 0) {
    throw new Error(`대화 #${conversationId}에 메시지가 없어요.`);
  }

  const userPrompt = buildUserPrompt(conversation.title, conversation.messages);

  const response = await session.client.messages.create({
    model: session.model,
    max_tokens: 1024,
    system: ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  // 응답 블록에서 텍스트 추출
  const rawText = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  const parsed = parseAnalysisJson(rawText);

  // DB 반영: 대화 메타 업데이트 + 태그 레지스트리 업데이트
  await updateConversation(conversationId, {
    tag_category: parsed.category,
    tags: parsed.tags,
    summary: parsed.summary,
    keywords: parsed.keywords,
    is_analyzed: true,
    analyzed_at: new Date().toISOString(),
  });

  // 태그 테이블에 등록/증감
  for (const tagName of parsed.tags) {
    await upsertTag(tagName, parsed.category);
  }

  return parsed;
}

/**
 * Claude 응답 텍스트를 JSON으로 파싱 (방어적)
 */
function parseAnalysisJson(text) {
  if (!text) throw new Error("Claude가 빈 응답을 보냈어요.");

  // 마크다운 코드블록이 섞여있으면 제거
  let cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```\s*$/i, "")
    .trim();

  // 중괄호 위치만 잘라내기 (앞뒤 잡설 대비)
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  let data;
  try {
    data = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`분석 결과 JSON 파싱 실패: ${err.message}`);
  }

  // 필드 검증 + 보정
  const category = isValidCategory(data.category) ? data.category : "personal";
  const tags = Array.isArray(data.tags)
    ? data.tags.filter((t) => typeof t === "string" && t.trim()).slice(0, 5)
    : [];
  const summary =
    typeof data.summary === "string" ? data.summary.trim().slice(0, 200) : "";
  const keywords = Array.isArray(data.keywords)
    ? data.keywords.filter((k) => typeof k === "string" && k.trim()).slice(0, 5)
    : [];

  return { category, tags, summary, keywords };
}

/**
 * 배치 분석 — 여러 대화를 순차 처리 (Rate Limit 대응)
 * @param {Array<number>} ids
 * @param {(progress) => void} onProgress
 * @returns {Promise<BatchAnalysisResult>}
 */
export async function analyzeBatch(ids, onProgress, signal) {
  const result = {
    total: ids.length,
    succeeded: 0,
    failed: 0,
    errors: [],
  };

  for (let i = 0; i < ids.length; i++) {
    if (signal?.aborted) {
      onProgress?.({ phase: "aborted", index: i, total: ids.length });
      break;
    }

    const id = ids[i];
    onProgress?.({
      phase: "analyzing",
      index: i + 1,
      total: ids.length,
      currentId: id,
    });

    try {
      await analyzeConversation(id);
      result.succeeded += 1;
    } catch (err) {
      result.failed += 1;
      result.errors.push({ id, message: err.message });
      // 401/403 같은 치명적 오류면 중단
      if (/API 키|401|403/i.test(err.message)) {
        onProgress?.({ phase: "aborted", index: i, total: ids.length });
        break;
      }
    }

    // Rate Limit 완화 (400ms 간격)
    await sleep(400);
  }

  onProgress?.({ phase: "done", ...result });
  return result;
}

/**
 * 분석되지 않은 모든 대화 분석
 */
export async function analyzeAllUnanalyzed(onProgress, signal) {
  const unanalyzed = await getUnanalyzedConversations();
  const ids = unanalyzed.map((c) => c.id);
  if (ids.length === 0) {
    onProgress?.({
      phase: "done",
      total: 0,
      succeeded: 0,
      failed: 0,
      errors: [],
    });
    return { total: 0, succeeded: 0, failed: 0, errors: [] };
  }
  return analyzeBatch(ids, onProgress, signal);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
