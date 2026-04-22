import { db } from "./database";

export * from "./conversations";
export * from "./tags";
export * from "./settings";
export * from "./similarities";
export { db };

/**
 * 전체 DB 초기화 (개발/테스트용)
 */
export async function resetDatabase() {
  await db.delete();
  window.location.reload();
}

/**
 * DB 통계 한 번에 조회
 */
export async function getDatabaseStats() {
  const [conversationCount, messageCount, tagCount] = await Promise.all([
    db.conversations.count(),
    db.messages.count(),
    db.tags.count(),
  ]);
  return { conversationCount, messageCount, tagCount };
}
