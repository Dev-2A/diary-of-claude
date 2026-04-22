/**
 * 대화 간 유사도 계산 엔진
 *
 * 알고리즘:
 *  1. 태그 Jaccard 유사도 (가중치 0.5)
 *  2. 키워드 Jaccard 유사도 (가중치 0.3)
 *  3. 같은 카테고리 보너스 (가중치 0.2)
 *  → 최종 점수 0.0 ~ 1.0
 */

import { db, saveSimilarity, clearAllSimilarities } from "../db";

const MIN_SCORE_THRESHOLD = 0.2; // 이 미만은 저장 안 함 (그래프 노이즈 제거)

/**
 * Jaccard 유사도: |A ∩ B| / |A ∪ B|
 */
function jaccard(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 0;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * 문자열 배열을 정규화된 Set으로 변환
 * - 소문자, 공백 제거, 빈 항목 제거
 */
function toNormalizedSet(arr) {
  const set = new Set();
  if (!Array.isArray(arr)) return set;
  for (const item of arr) {
    if (typeof item !== "string") continue;
    const norm = item.trim().toLowerCase();
    if (norm) set.add(norm);
  }
  return set;
}

/**
 * 두 대화의 유사도 점수 계산
 * @returns {number} 0~1
 */
export function calculateSimilarity(convA, convB) {
  if (!convA || !convB) return 0;
  if (convA.id === convB.id) return 0;
  if (!convA.is_analyzed || !convB.is_analyzed) return 0;

  // 1. 태그 Jaccard
  const tagA = toNormalizedSet(convA.tags);
  const tagB = toNormalizedSet(convB.tags);
  const tagSim = jaccard(tagA, tagB);

  // 2. 키워드 Jaccard
  const kwA = toNormalizedSet(convA.keywords);
  const kwB = toNormalizedSet(convB.keywords);
  const kwSim = jaccard(kwA, kwB);

  // 3. 카테고리 일치 보너스
  const catBonus =
    convA.tag_category && convA.tag_category === convB.tag_category ? 1 : 0;

  // 가중 평균
  const score = tagSim * 0.5 + kwSim * 0.3 + catBonus * 0.2;
  return Math.min(1, score);
}

/**
 * 모든 분석된 대화 쌍에 대해 유사도 계산 및 DB 저장
 * - O(n²) 이므로 대화가 많으면 시간이 걸림
 * - 기존 데이터는 리셋 후 재계산
 */
export async function computeAllSimilarities(onProgress, signal) {
  const all = await db.conversations.toArray();
  const analyzed = all.filter((c) => c.is_analyzed);

  const result = {
    total: analyzed.length,
    pairs: 0,
    saved: 0,
    skipped: 0,
    error: null,
  };

  if (analyzed.length < 2) {
    onProgress?.({ phase: "done", ...result });
    return result;
  }

  try {
    // 기존 유사도 초기화
    await clearAllSimilarities();

    const totalPairs = (analyzed.length * (analyzed.length - 1)) / 2;
    let processed = 0;

    for (let i = 0; i < analyzed.length; i++) {
      if (signal?.aborted) {
        onProgress?.({ phase: "aborted", ...result });
        break;
      }

      for (let j = i + 1; j < analyzed.length; j++) {
        const a = analyzed[i];
        const b = analyzed[j];
        const score = calculateSimilarity(a, b);
        processed += 1;
        result.pairs += 1;

        if (score >= MIN_SCORE_THRESHOLD) {
          await saveSimilarity(a.id, b.id, score);
          result.saved += 1;
        } else {
          result.skipped += 1;
        }

        // UI 업데이트 (매 50쌍마다)
        if (processed % 50 === 0 || processed === totalPairs) {
          onProgress?.({
            phase: "computing",
            processed,
            totalPairs,
            saved: result.saved,
          });
        }
      }
    }

    onProgress?.({ phase: "done", ...result });
    return result;
  } catch (err) {
    result.error = err.message;
    onProgress?.({ phase: "error", ...result });
    throw err;
  }
}

/**
 * 그래프 렌더링용 노드·엣지 구조 생성
 * @param {number} threshold — 이 이상의 유사도만 링크로 표시
 */
export async function buildGraphData(threshold = 0.3) {
  const [similarities, allConversations] = await Promise.all([
    db.similarities.filter((s) => s.score >= threshold).toArray(),
    db.conversations.toArray(),
  ]);

  // 분석된 대화만 노드로 사용
  const analyzed = allConversations.filter((c) => c.is_analyzed);
  const validIds = new Set(analyzed.map((c) => c.id));

  // ★ 고아 링크 필터링 — 양쪽 노드가 모두 살아있는 링크만
  const validLinks = similarities.filter(
    (s) => validIds.has(s.a_id) && validIds.has(s.b_id),
  );

  // 백그라운드에서 고아 링크 정리 (await 안 함 — 비동기 청소)
  const orphanCount = similarities.length - validLinks.length;
  if (orphanCount > 0) {
    cleanupOrphanSimilarities(validIds).catch((err) =>
      console.warn("고아 유사도 링크 정리 중 오류:", err),
    );
  }

  // 링크로 연결된 id 집합
  const connectedIds = new Set();
  for (const s of validLinks) {
    connectedIds.add(s.a_id);
    connectedIds.add(s.b_id);
  }

  const nodes = analyzed.map((c) => ({
    id: c.id,
    title: c.title,
    category: c.tag_category,
    tags: c.tags || [],
    summary: c.summary,
    messageCount: c.message_count,
    createdAt: c.created_at,
    isIsolated: !connectedIds.has(c.id),
  }));

  const links = validLinks.map((s) => ({
    source: s.a_id,
    target: s.b_id,
    score: s.score,
  }));

  return { nodes, links };
}

/**
 * 노드가 사라진 고아 유사도 링크 청소
 */
async function cleanupOrphanSimilarities(validIds) {
  const all = await db.similarities.toArray();
  const orphanKeys = [];
  for (const s of all) {
    if (!validIds.has(s.a_id) || !validIds.has(s.b_id)) {
      orphanKeys.push([s.a_id, s.b_id]);
    }
  }
  if (orphanKeys.length > 0) {
    await db.similarities.bulkDelete(orphanKeys);
    console.log(`🧹 고아 유사도 링크 ${orphanKeys.length}개 정리 완료`);
  }
}
