/**
 * ISO → "2026년 4월 22일 (수) 오후 2시 30분" 형식
 */
export function formatFullDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/**
 * ISO → "2026. 4. 22." 형식
 */
export function formatShortDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("ko-KR");
}

/**
 * ISO → 상대 시간 ("3일 전", "2개월 전")
 */
export function formatRelative(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const diff = Date.now() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return "방금";
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 30) return `${days}일 전`;
  if (months < 12) return `${months}개월 전`;
  return `${years}년 전`;
}

/**
 * 글자 수 → 예상 읽기 시간 (한국어 기준 400자/분)
 */
export function estimateReadTime(totalChars) {
  if (!totalChars || totalChars < 1) return "1분 미만";
  const minutes = Math.max(1, Math.ceil(totalChars / 400));
  return `${minutes}분`;
}
