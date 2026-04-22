import Anthropic from "@anthropic-ai/sdk";
import { getSetting, SETTING_KEYS } from "../db/settings";
import { DEFAULT_MODEL_ID } from "../constants/models";

/**
 * API 키를 받아 Anthropic 클라이언트 생성
 * BYOK 방식이라 브라우저 직접 호출을 허용 (dangerouslyAllowBrowser)
 */
export function createClient(apiKey) {
  if (!apiKey) throw new Error("API 키가 설정되지 않았어요.");
  return new Anthropic({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}

/**
 * DB에 저장된 키·모델로 클라이언트 반환 (설정 없으면 null)
 */
export async function getClient() {
  const apiKey = await getSetting(SETTING_KEYS.ANTHROPIC_API_KEY);
  if (!apiKey) return null;
  const model =
    (await getSetting(SETTING_KEYS.ANTHROPIC_MODEL)) || DEFAULT_MODEL_ID;
  return { client: createClient(apiKey), model };
}

/**
 * 연결 테스트 — 최소 비용의 짧은 메시지 1회 호출
 * @returns {Promise<{ ok: true, model: string } | { ok: false, error: string, status?: number }>}
 */
export async function testConnection(apiKey, model = DEFAULT_MODEL_ID) {
  try {
    const client = createClient(apiKey);
    const res = await client.messages.create({
      model,
      max_tokens: 8,
      messages: [{ role: "user", content: "ping" }],
    });
    return { ok: true, model: res.model };
  } catch (err) {
    const status = err?.status;
    let message = err?.message || "알 수 없는 오류가 발생했어요.";

    if (status === 401)
      message = "API 키가 유효하지 않아요. sk-ant- 로 시작하는지 확인해주세요.";
    else if (status === 403)
      message = "이 키로는 해당 모델에 접근할 수 없어요.";
    else if (status === 404)
      message = "선택한 모델을 찾을 수 없어요. 다른 모델로 시도해주세요.";
    else if (status === 429)
      message = "요청이 너무 많아요. 잠시 후 다시 시도해주세요.";
    else if (status === 529)
      message = "Anthropic 서버가 과부하 상태예요. 잠시 후 재시도해주세요.";

    return { ok: false, error: message, status };
  }
}

/**
 * 키 마스킹 — sk-ant-api03-abcd....xyz
 */
export function maskApiKey(key) {
  if (!key) return "";
  if (key.length < 20) return key.slice(0, 4) + "…";
  return `${key.slice(0, 12)}…${key.slice(-4)}`;
}
