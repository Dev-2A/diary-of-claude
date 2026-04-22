import { TAG_CATEGORIES } from "../db/schema";

/**
 * 대화 분석 프롬프트 빌더
 *
 * 설계 원칙:
 * - JSON 형식 강제 (파싱 안정성)
 * - 카테고리는 사전 정의된 목록에서만 선택
 * - 태그는 2~5개, 한국어 우선
 * - 요약은 한 문장 + 핵심 키워드
 */

export const ANALYSIS_SYSTEM_PROMPT = `당신은 Claude 대화 아카이브를 분류하는 메타 분석 도우미입니다.

사용자가 Claude와 나눈 대화 내용을 읽고, 다음 규칙에 따라 JSON으로만 응답하세요.

## 카테고리 (반드시 아래 중 하나)
- coding: 코드 작성, 디버깅, 기술 구현, 스택 선택
- writing: 글쓰기, 이메일, 문서 작성, 번역
- learning: 개념 설명, 학습, 튜토리얼, 원리 질문
- brainstorm: 아이디어 발굴, 이름 짓기, 기획, 의사결정
- debug: 에러 해결, 트러블슈팅 (코딩이 주된 목적이 아닌 경우)
- design: UI/UX, 시각 디자인, 색상, 레이아웃
- analysis: 데이터 분석, 요약, 검토, 비교
- personal: 일상 대화, 개인 고민, 취미, 잡담

## 출력 JSON 형식 (반드시 이 구조만)
{
  "category": "위 카테고리 중 하나",
  "tags": ["한국어 태그 2~5개"],
  "summary": "한 문장으로 요약 (50자 이내)",
  "keywords": ["핵심 키워드 3~5개"]
}

## 주의사항
- JSON 외 다른 텍스트(설명, 마크다운 코드 블록 등)를 절대 포함하지 마세요.
- 태그는 구체적이고 검색 가능한 명사로. (예: "React 훅", "에어갭 배포", "BGE-M3")
- summary는 무엇을 했는지 동사형으로. (예: "React 컴포넌트 구조를 설계함")`;

/**
 * 대화 메시지를 프롬프트용 텍스트로 변환
 * - 너무 길면 앞뒤 잘라내기 (비용·토큰 관리)
 */
export function buildUserPrompt(title, messages, maxChars = 12000) {
  const formatted = messages
    .map((m) => {
      const role = m.role === "user" ? "사용자" : "Claude";
      return `[${role}]\n${m.content}`;
    })
    .join("\n\n---\n\n");

  let snippet = formatted;
  if (formatted.length > maxChars) {
    const half = Math.floor(maxChars / 2);
    snippet =
      formatted.slice(0, half) +
      "\n\n...(중략)...\n\n" +
      formatted.slice(-half);
  }

  return `## 대화 제목
${title}

## 대화 내용
${snippet}

---

위 대화를 분석해서 정해진 JSON 형식으로만 응답하세요.`;
}

/** 허용 카테고리 화이트리스트 검증 */
export function isValidCategory(category) {
  return TAG_CATEGORIES.includes(category);
}
