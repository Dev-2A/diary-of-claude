import { db } from "./database";

/**
 * 유사도 저장 (a_id < b_id 정렬해서 중복 방지)
 */
export async function saveSimilarity(aId, bId, score) {
  const [a, b] = aId < bId ? [aId, bId] : [bId, aId];
  return db.similarities.put({ a_id: a, b_id: b, score });
}

/**
 * 특정 대화의 모든 유사도 관계 조회
 */
export async function getSimilaritiesOf(conversationId) {
  const asA = await db.similarities
    .where("a_id")
    .equals(conversationId)
    .toArray();
  const asB = await db.similarities
    .where("b_id")
    .equals(conversationId)
    .toArray();
  return [...asA, ...asB];
}

/**
 * 전체 유사도 조회 (임계값 이상만)
 */
export async function getAllSimilarities(threshold = 0.3) {
  return db.similarities.filter((s) => s.score >= threshold).toArray();
}

/**
 * 모든 유사도 초기화
 */
export async function clearAllSimilarities() {
  return db.similarities.clear();
}
