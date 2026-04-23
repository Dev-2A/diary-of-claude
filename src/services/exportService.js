/**
 * 대화 내보내기 엔진
 *
 * 지원 포맷:
 *  - markdown   : 단일 .md 파일 (사람 친화적)
 *  - json       : Claude 공식 export 호환
 *  - notion     : Notion 임포트용 마크다운 (callout/toggle 활용)
 *  - github     : GitHub Issue 본문 (제목·설명·체크리스트)
 */

import { getConversationWithMessages } from "../db/conversations";
import { MESSAGE_ROLES } from "../db/schema";

const CATEGORY_LABELS = {
  coding: "코딩",
  writing: "글쓰기",
  learning: "학습",
  brainstorm: "브레인스토밍",
  debug: "디버깅",
  design: "디자인",
  analysis: "분석",
  personal: "개인",
};

/**
 * 여러 대화 ID를 받아 메시지까지 로드
 */
async function loadConversationsFull(ids) {
  const result = [];
  for (const id of ids) {
    const conv = await getConversationWithMessages(id);
    if (conv) result.push(conv);
  }
  return result;
}

/**
 * 메인 export 함수
 * @returns {Promise<{ filename, content, mime }>}
 */
export async function exportConversations(ids, format, options = {}) {
  if (!ids || ids.length === 0) {
    throw new Error("내보낼 대화가 없어요.");
  }

  const conversations = await loadConversationsFull(ids);
  const fnBase =
    options.filename || generateFilenameBase(conversations, format);

  switch (format) {
    case "markdown":
      return {
        filename: `${fnBase}.md`,
        content: toMarkdown(conversations, options),
        mime: "text/markdown",
      };
    case "json":
      return {
        filename: `${fnBase}.json`,
        content: toJson(conversations, options),
        mime: "application/json",
      };
    case "notion":
      return {
        filename: `${fnBase}-notion.md`,
        content: toNotionMarkdown(conversations, options),
        mime: "text/markdown",
      };
    case "github":
      return {
        filename: `${fnBase}-github-issue.md`,
        content: toGitHubIssue(conversations, options),
        mime: "text/markdown",
      };
    default:
      throw new Error(`지원하지 않는 포맷: ${format}`);
  }
}

// =====================================================================
// Markdown — 사람 친화적 표준 포맷
// =====================================================================
function toMarkdown(conversations, { groupTitle }) {
  const lines = [];
  if (groupTitle) {
    lines.push(`# ${groupTitle}`);
    lines.push("");
    lines.push(
      `> Diary of Claude에서 내보낸 대화 모음 · ${conversations.length}건 · ${new Date().toLocaleDateString("ko-KR")}`,
    );
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  for (let i = 0; i < conversations.length; i++) {
    const c = conversations[i];
    if (i > 0) {
      lines.push("");
      lines.push("---");
      lines.push("");
    }

    lines.push(`## ${c.title}`);
    lines.push("");

    // 메타
    const metaParts = [`📅 ${formatDate(c.created_at)}`];
    if (c.tag_category)
      metaParts.push(`🏷️ ${CATEGORY_LABELS[c.tag_category] || c.tag_category}`);
    metaParts.push(`💬 ${c.message_count || c.messages?.length || 0}개 메시지`);
    lines.push(`> ${metaParts.join(" · ")}`);
    lines.push("");

    if (c.summary) {
      lines.push(`**요약**: ${c.summary}`);
      lines.push("");
    }

    if (c.tags && c.tags.length > 0) {
      lines.push(`**태그**: ${c.tags.map((t) => `\`${t}\``).join(" ")}`);
      lines.push("");
    }

    // 메시지
    for (const msg of c.messages || []) {
      const speaker =
        msg.role === MESSAGE_ROLES.USER ? "👤 사용자" : "✨ Claude";
      lines.push(`### ${speaker}`);
      lines.push("");
      lines.push(msg.content || "");
      lines.push("");
    }
  }

  return lines.join("\n");
}

// =====================================================================
// JSON — Claude 공식 export 호환
// =====================================================================
function toJson(conversations) {
  const data = conversations.map((c) => ({
    uuid: c.uuid,
    name: c.title,
    created_at: c.created_at,
    updated_at: c.updated_at,
    chat_messages: (c.messages || []).map((m) => ({
      sender: m.role === MESSAGE_ROLES.USER ? "human" : "assistant",
      text: m.content,
      created_at: m.created_at,
    })),
    diary_meta: {
      tag_category: c.tag_category,
      tags: c.tags,
      keywords: c.keywords,
      summary: c.summary,
      analyzed_at: c.analyzed_at,
    },
  }));
  return JSON.stringify(data, null, 2);
}

// =====================================================================
// Notion — callout, toggle 등 Notion 마크다운 확장 활용
// =====================================================================
function toNotionMarkdown(conversations, { groupTitle }) {
  const lines = [];
  if (groupTitle) {
    lines.push(`# 📚 ${groupTitle}`);
    lines.push("");
    lines.push(
      `> 💡 Diary of Claude에서 내보낸 대화 모음 · 총 ${conversations.length}건`,
    );
    lines.push("");
  }

  // 목차
  if (conversations.length > 1) {
    lines.push("## 📑 목차");
    lines.push("");
    for (const c of conversations) {
      const cat = c.tag_category
        ? ` (${CATEGORY_LABELS[c.tag_category] || c.tag_category})`
        : "";
      lines.push(`- ${c.title}${cat}`);
    }
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  for (const c of conversations) {
    lines.push(`## ${c.title}`);
    lines.push("");

    // Notion callout 스타일
    const cat = c.tag_category
      ? CATEGORY_LABELS[c.tag_category] || c.tag_category
      : "미분류";
    lines.push(
      `> 📅 **${formatDate(c.created_at)}** · 🏷️ ${cat} · 💬 ${c.messages?.length || 0}개`,
    );
    lines.push("");

    if (c.summary) {
      lines.push(`> 💡 **요약**`);
      lines.push(`> ${c.summary}`);
      lines.push("");
    }

    if (c.tags && c.tags.length > 0) {
      lines.push(c.tags.map((t) => `#${t.replace(/\s+/g, "_")}`).join(" "));
      lines.push("");
    }

    // 메시지를 toggle로 (Notion의 ▶︎ 형태)
    lines.push("<details>");
    lines.push(
      `<summary>대화 전문 (${c.messages?.length || 0}개 메시지)</summary>`,
    );
    lines.push("");
    for (const msg of c.messages || []) {
      const speaker =
        msg.role === MESSAGE_ROLES.USER ? "**👤 나**" : "**✨ Claude**";
      lines.push(speaker);
      lines.push("");
      lines.push(msg.content || "");
      lines.push("");
    }
    lines.push("</details>");
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  return lines.join("\n");
}

// =====================================================================
// GitHub Issue — 단일 이슈 본문
// =====================================================================
function toGitHubIssue(conversations, { groupTitle }) {
  const lines = [];
  const title =
    groupTitle ||
    (conversations.length === 1
      ? conversations[0].title
      : `Claude 대화 정리 (${conversations.length}건)`);

  lines.push(`# ${title}`);
  lines.push("");
  lines.push(`> Diary of Claude에서 자동 생성된 대화 요약입니다.`);
  lines.push("");

  // 카테고리별 집계
  const byCategory = {};
  for (const c of conversations) {
    const cat = c.tag_category || "uncategorized";
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(c);
  }

  if (Object.keys(byCategory).length > 1) {
    lines.push("## 📊 분류 요약");
    lines.push("");
    for (const [cat, items] of Object.entries(byCategory)) {
      const label = CATEGORY_LABELS[cat] || cat;
      lines.push(`- **${label}**: ${items.length}건`);
    }
    lines.push("");
  }

  // 각 대화를 체크리스트로
  lines.push("## ✅ 대화 목록");
  lines.push("");
  for (const c of conversations) {
    const cat = c.tag_category
      ? `\`${CATEGORY_LABELS[c.tag_category] || c.tag_category}\``
      : "";
    lines.push(`- [ ] **${c.title}** ${cat}`);
    if (c.summary) {
      lines.push(`  - ${c.summary}`);
    }
    if (c.tags && c.tags.length > 0) {
      lines.push(`  - 태그: ${c.tags.map((t) => `\`${t}\``).join(" ")}`);
    }
    lines.push(
      `  - 일시: ${formatDate(c.created_at)} · ${c.messages?.length || 0}개 메시지`,
    );
  }
  lines.push("");

  // 핵심 키워드
  const allKeywords = new Set();
  for (const c of conversations) {
    for (const k of c.keywords || []) allKeywords.add(k);
  }
  if (allKeywords.size > 0) {
    lines.push("## 🔑 핵심 키워드");
    lines.push("");
    lines.push(
      Array.from(allKeywords)
        .map((k) => `\`${k}\``)
        .join(" "),
    );
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(
    `<sub>📚 Generated by Diary of Claude · ${new Date().toLocaleDateString("ko-KR")}</sub>`,
  );

  return lines.join("\n");
}

// =====================================================================
// 유틸
// =====================================================================
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ko-KR");
}

function generateFilenameBase(conversations, format) {
  const today = new Date().toISOString().slice(0, 10);
  const count = conversations.length;
  return `diary-of-claude-${count}건-${today}`;
}

/**
 * 텍스트를 Blob으로 다운로드
 */
export function downloadAsFile(filename, content, mime = "text/plain") {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 클립보드 복사
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // fallback
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      return true;
    } catch (e) {
      return false;
    } finally {
      document.body.removeChild(ta);
    }
  }
}
