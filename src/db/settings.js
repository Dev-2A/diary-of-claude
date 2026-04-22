import { db } from "./database";

export const SETTING_KEYS = {
  ANTHROPIC_API_KEY: "anthropic_api_key",
  ANTHROPIC_MODEL: "anthropic_model",
  THEME: "THEME",
  AUTO_ANAYZE: "auto_analyze",
};

/**
 * 설정 값 가져오기
 */
export async function getSetting(key, defaultValue = null) {
  const row = await db.settings.where("key").equals(key).first();
  return row ? row.value : defaultValue;
}

/**
 * 설정 값 저장 (upsert)
 */
export async function setSetting(key, value) {
  const existing = await db.settings.where("key").equals(key).first();
  if (existing) {
    return db.settings.update(existing.key, { value });
  }
  return db.settings.put({ key, value });
}

/**
 * 모든 설정 조회
 */
export async function getAllSettings() {
  const rows = await db.settings.toArray();
  return rows.reduce((acc, { key, value }) => {
    acc[key] = value;
    return acc;
  }, {});
}

/**
 * 설정 삭제
 */
export async function deleteSetting(key) {
  return db.settings.where("key").equals(key).delete();
}
