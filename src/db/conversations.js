import { db } from "./database";

/**
 * 대화 생성
 * @param {Object} conversation - { uuid, title, messages, source_file, ... }
 * @returns {Promise<number>} - 생성된 conversation id
 */
export async function createConversation(conversation) {
  const now = new Date().toISOString();
  const { messages = [], ...meta } = conversation;

  return db.transaction("rw", db.conversations, db.messages, async () => {
    const conversationId = await db.conversations.add({
      uuid: meta.uuid || crypto.randomUUID(),
      title: meta.title || "제목 없는 대화",
      created_at: meta.created_at || now,
      updated_at: meta.updated_at || now,
      tag_category: meta.tag_category || null,
      summary: meta.summary || null,
      tags: meta.tags || [],
      source_file: meta.source_file || null,
      message_count: messages.length,
      is_analyzed: meta.is_analyzed || false,
      raw_preview: messages[0]?.content?.slice(0, 200) || "",
    });

    if (messages.length > 0) {
      await db.messages.bulkAdd(
        messages.map((msg, idx) => ({
          conversation_id: conversationId,
          role: msg.role,
          content: msg.content,
          order_index: idx,
          created_at: msg.created_at || now,
        })),
      );
    }

    return conversationId;
  });
}

/**
 * 대화 하나 조회 (메시지 포함)
 */
export async function getConversationWithMessages(id) {
  const conversation = await db.conversations.get(Number(id));
  if (!conversation) return null;

  const messages = await db.messages
    .where("conversation_id")
    .equals(conversation.id)
    .sortBy("order_index");

  return { ...conversation, messages };
}

/**
 * 모든 대화 조회 (최신순)
 */
export async function getAllConversations() {
  return db.conversations.orderBy("created_at").reverse().toArray();
}

/**
 * 대화 업데이트
 */
export async function updateConversation(id, changes) {
  return db.conversations.update(Number(id), {
    ...changes,
    updated_at: new Date().toISOString(),
  });
}

/**
 * 대화 삭제 (메시지도 함께)
 */
export async function deleteConversation(id) {
  return db.transaction(
    "rw",
    db.conversations,
    db.messages,
    db.similarities,
    async () => {
      await db.messages.where("conversation_id").equals(Number(id)).delete();
      await db.similarities.where("a_id").equals(Number(id)).delete();
      await db.similarities.where("b_id").equals(Number(id)).delete();
      await db.conversations.delete(Number(id));
    },
  );
}

/**
 * 이미 업로드된 대화인지 확인 (uuid 기반)
 */
export async function findByUuid(uuid) {
  return db.conversations.where("uuid").equals(uuid).first();
}

/**
 * 대화 개수
 */
export async function countConversations() {
  return db.conversations.count();
}

/**
 * 분석되지 않은 대화만 조회
 */
export async function getUnanalyzedConversations() {
  return db.conversations.filter((c) => !c.is_analyzed).toArray();
}

/**
 * 기간 내 대화 조회
 */
export async function getConversationsByDateRange(startISO, endISO) {
  return db.conversations
    .where("created_at")
    .between(startISO, endISO, true, true)
    .toArray();
}

/**
 * 태그로 대화 필터
 */
export async function getConversationsByTag(tagName) {
  return db.conversations.where("tags").equals(tagName).toArray();
}
