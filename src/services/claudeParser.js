/**
 * Claude 대화 export 파서
 *
 * 지원 포맷:
 * 1. .json  — Claude 공식 데이터 export (배열 형태)
 * 2. .md    — "Title: ..." + "H: ..." + "A: ..." 형식의 마크다운
 */

import { MESSAGE_ROLES } from "../db/schema";

/**
 * 메인 엔트리 — 파일명과 내용을 받아 대화 배열을 반환
 * @returns {Array<{ uuid, title, created_at, updated_at, messages, source_file }>}
 */
export function parseClaudeExport(fileName, content) {
  const ext = fileName.toLowerCase().split(".").pop();

  if (ext === "json") {
    return parseJson(content, fileName);
  }
  if (ext === "md" || ext === "markdown" || ext === "txt") {
    return parseMarkdown(content, fileName);
  }
  throw new Error(`지원하지 않는 파일 형식: .${ext} (.md 또는 .json만 지원)`);
}

// =================================================================
// JSON 파서 (Claude 공식 export 구조)
// =================================================================

function parseJson(content, fileName) {
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    throw new Error(`JSON 파싱 실패: ${e.message}`);
  }

  // Cluade export는 보통 배열 형태지만, 단일 객체일 수도 있어서 둘 다 허용
  const conversations = Array.isArray(data) ? data : [data];

  return conversations
    .map((conv) => normalizeJsonConversation(conv, fileName))
    .filter(Boolean);
}

function normalizeJsonConversation(conv, fileName) {
  const title = conv.name || conv.title || "제목 없는 대화";
  const created_at = toISOString(
    conv.created_at || conv.createdAt || conv.created,
  );
  const updated_at = toISOString(
    conv.updated_at || conv.updatedAt || conv.updated || created_at,
  );

  const rawMessages = conv.chat_messages || conv.messages || [];
  const messages = rawMessages
    .map((msg) => normalizeJsonMessage(msg))
    .filter(Boolean);

  if (messages.length === 0) return null;

  // ★ uuid가 없을 때도 결정론적 폴백
  const uuid =
    conv.uuid ||
    conv.id ||
    generateDeterministicUuid(fileName, title, messages[0]?.content || "", 0);

  return {
    uuid,
    title,
    created_at,
    updated_at,
    messages,
    source_file: fileName,
  };
}

function normalizeJsonMessage(msg) {
  // sender / role 둘 다 가능
  const sender = (msg.sender || msg.role || "").toLowerCase();
  let role;
  if (sender === "human" || sender === "user") role = MESSAGE_ROLES.USER;
  else if (sender === "assistant" || sender === "claude")
    role = MESSAGE_ROLES.ASSISTANT;
  else role = MESSAGE_ROLES.SYSTEM;

  // content는 문자열 또는 블록 배열(text/tool_use 등 포함)
  let content = "";
  if (typeof msg.text === "string") {
    content = msg.text;
  } else if (typeof msg.content === "string") {
    content = msg.content;
  } else if (Array.isArray(msg.content)) {
    content = msg.content
      .map((block) => block.text || block.content || "")
      .filter(Boolean)
      .join("\n\n");
  }

  content = content.trim();
  if (!content) return null;

  return {
    role,
    content,
    created_at: toISOString(msg.created_at || msg.createdAt || msg.created),
  };
}

// =================================================================
// Markdown 파서 (대화 아카이빙 export 스타일)
// =================================================================

/**
 * 지원 형식 예시:
 *
 *   Title: 채팅 제목
 *
 *   H: 사람 메시지
 *
 *   A: Claude 메시지
 *
 *   H: 또 다른 메시지
 *   ...
 *
 * 또는:
 *
 *   # 채팅 제목
 *
 *   **Human:** ...
 *
 *   **Assistant:** ...
 */
function parseMarkdown(content, fileName) {
  const blocks = splitMarkdownByConversation(content);

  return blocks
    .map((block, index) =>
      parseSingleMarkdownConversation(block, fileName, index),
    )
    .filter(Boolean);
}

function splitMarkdownByConversation(content) {
  // "Title: ..." 라인 또는 "# " H1을 대화 구분점으로 사용
  const lines = content.split(/\r?\n/);
  const blocks = [];
  let current = [];

  for (const line of lines) {
    const isTitleLine = /^Title:\s+.+/i.test(line) || /^#\s+[^#]/.test(line);

    if (isTitleLine && current.length > 0) {
      blocks.push(current.join("\n"));
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) blocks.push(current.join("\n"));

  // 구분점이 없으면 전체를 하나의 대화로 취급
  return blocks.length > 0 ? blocks : [content];
}

function parseSingleMarkdownConversation(block, fileName, index = 0) {
  const lines = block.split(/\r?\n/);

  // 제목 추출
  let title = "제목 없는 대화";
  const titleMatch =
    block.match(/^Title:\s+(.+)$/im) || block.match(/^#\s+(.+)$/m);
  if (titleMatch) title = titleMatch[1].trim();

  // 화자 구분 정규식
  const speakerRegex =
    /^(H|A|Human|Assistant|Claude|User|사용자|\*\*Human\*\*|\*\*Assistant\*\*):\s*(.*)$/i;

  const messages = [];
  let currentRole = null;
  let currentContent = [];

  const flush = () => {
    if (currentRole && currentContent.length > 0) {
      const content = currentContent.join("\n").trim();
      if (content) {
        messages.push({
          role: currentRole,
          content,
          created_at: null,
        });
      }
    }
    currentContent = [];
  };

  for (const line of lines) {
    if (/^Title:\s+/i.test(line)) continue;
    if (
      /^#\s+/.test(line) &&
      messages.length === 0 &&
      currentContent.length === 0
    )
      continue;

    const match = line.match(speakerRegex);
    if (match) {
      flush();
      const speaker = match[1].toLowerCase().replace(/\*/g, "");
      if (["h", "human", "user", "사용자"].includes(speaker)) {
        currentRole = MESSAGE_ROLES.USER;
      } else {
        currentRole = MESSAGE_ROLES.ASSISTANT;
      }
      if (match[2]) currentContent.push(match[2]);
    } else {
      currentContent.push(line);
    }
  }
  flush();

  if (messages.length === 0) return null;

  const extracted = extractDateFromFileName(fileName);
  const now = new Date().toISOString();
  const createdAt = extracted || now;

  // ★ 결정론적 UUID — 같은 파일+제목+첫 메시지면 같은 ID
  const firstMessageContent = messages[0]?.content || "";
  const uuid = generateDeterministicUuid(
    fileName,
    title,
    firstMessageContent,
    index,
  );

  return {
    uuid,
    title,
    created_at: createdAt,
    updated_at: createdAt,
    messages,
    source_file: fileName,
  };
}

// =================================================================
// 유틸
// =================================================================

function toISOString(value) {
  if (!value) return new Date().toISOString();
  // 이미 ISO 형식이면 그대로, 숫자면 타임스탬프
  if (typeof value === "number") return new Date(value).toISOString();
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function extractDateFromFileName(fileName) {
  // 예: "2025-11-03_conversation.md" → "2025-11-03T00:00:00.000Z"
  const match = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(`${y}-${m}-${d}T00:00:00Z`);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

/**
 * djb2 해시 — 문자열을 32bit 정수로 변환 (결정론적)
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) + hash + str.charCodeAt(i);
    hash = hash >>> 0; // unsigned 32bit
  }
  return hash.toString(16).padStart(8, "0");
}

/**
 * 마크다운 대화용 결정론적 UUID 생성
 * 같은 (파일명 + 제목 + 첫 메시지 내용 + 순서)이면 같은 UUID 반환
 */
function generateDeterministicUuid(
  fileName,
  title,
  firstMessageContent,
  index,
) {
  const normalizedContent = (firstMessageContent || "").slice(0, 500).trim();
  const seed = `${fileName}::${title}::${normalizedContent}::${index}`;
  const h1 = djb2Hash(seed);
  const h2 = djb2Hash(seed.split("").reverse().join(""));
  const h3 = djb2Hash(seed + seed); // 추가 엔트로피
  // UUID v4 유사 포맷 (충돌 가능성 낮추기 위해 36자 길이 맞춤)
  return `md-${h1}-${h2}-${h3}-${djb2Hash(h1 + h2 + h3)}`;
}
