import { db } from "./database";

/**
 * 태그 upsert (있으면 usage_count 증가, 없으면 생성)
 */
export async function upsertTag(name, category = null) {
  const existing = await db.tags.where("name").equals(name).first();
  if (existing) {
    await db.tags.update(existing.id, {
      usage_count: (existing.usage_count || 0) + 1,
      category: existing.category || category,
    });
    return existing.id;
  }
  return db.tags.add({
    name,
    category,
    usage_count: 1,
  });
}

/**
 * 모든 태그 (많이 쓰인 순)
 */
export async function getAllTags() {
  return db.tags.orderBy("usage_count").reverse().toArray();
}

/**
 * 카테고리별 태그
 */
export async function getTagsByCategory(category) {
  return db.tags.where("category").equals(category).toArray();
}

/**
 * 태그 개수
 */
export async function countTags() {
  return db.tags.count();
}
