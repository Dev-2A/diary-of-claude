# 📚 Diary of Claude

> Claude 대화 export를 로컬에서 분석·시각화·아카이빙하는 도구

[![Live Demo](https://img.shields.io/badge/demo-live-indigo?style=flat-square)](https://dev-2a.github.io/diary-of-claude/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat-square&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?style=flat-square&logo=vite)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![D3.js](https://img.shields.io/badge/D3.js-7-f9a03c?style=flat-square&logo=d3dotjs)](https://d3js.org)

**🌐 Live**: https://dev-2a.github.io/diary-of-claude/

---

## 💙 왜 만들었나

Claude와 1년간 토이 프로젝트 30개 넘게 만들고 나니, 그 **대화 자체가 자산**이 되었다. 어떤 주제로 무엇을 물었는지, 언제 무엇에 꽂혀 있었는지 — 이 아카이브를 정리하지 않으면 그대로 휘발된다.

사서 출신이라 "컬렉션을 정리하는 일"에는 일가견이 있다. 이전에 만든 [BookShelf.log](https://github.com/Dev-2A/bookshelf-log)가 *읽은 책*의 아카이브였다면, Diary of Claude는 *나눈 대화*의 아카이브다.

"취미 아카이빙" 시리즈 세 번째 작품.

---

## ✨ 주요 기능

### 📥 업로드 & 자동 분석
- Claude 공식 JSON export (`conversations.json`) 또는 마크다운 대화 아카이브 업로드
- **Claude API**로 각 대화의 **카테고리·태그·요약·키워드 자동 생성** (BYOK)
- 8가지 카테고리 분류: 코딩 / 글쓰기 / 학습 / 브레인스토밍 / 디버깅 / 디자인 / 분석 / 개인
- 배치 분석 지원 (Rate Limit 대응 + 중간 취소)

### 📊 메타 분석 시각화 (D3.js)
- **활동 히트맵**: GitHub 잔디 스타일의 날짜별 대화 밀도. 현재/최장 연속 기록 표시
- **월별 관심사 변화**: 스트림그래프로 시간에 따른 카테고리 흐름 시각화
- **대화 간 유사도 그래프**: Jaccard 유사도로 주제가 비슷한 대화를 force-directed 그래프로 연결

### 🔍 다중 조건 통합 검색
- 키워드 + 카테고리 + 태그(AND/OR) + 기간 + 분석 상태 + 메시지 수
- 메시지 본문까지 선택적 검색
- 결과 내 검색어 하이라이트

### 📤 외부 도구로 내보내기
- **Markdown**: 범용 `.md` 포맷
- **JSON**: Claude 공식 export 호환 + 분석 메타 포함
- **Notion**: 토글/콜아웃 활용한 Notion 임포트용 마크다운
- **GitHub Issue**: 체크리스트 형태의 이슈 본문

### 🔐 완전 로컬 처리 (Privacy-First)
- 모든 대화 데이터는 브라우저 **IndexedDB**에만 저장
- **BYOK** (Bring Your Own Key) — 본인 Anthropic API 키 사용
- 외부 요청은 오직 분석 시 Anthropic API 호출뿐
- 공용 PC에서는 API 키 삭제 후 퇴장 가능

---

## 🛠️ 기술 스택

| 분류 | 기술 |
|------|------|
| **프론트엔드** | React 19, Vite 7 |
| **스타일링** | Tailwind CSS v4 |
| **로컬 DB** | IndexedDB (Dexie.js 래퍼) |
| **시각화** | D3.js 7 (히트맵 · 스트림그래프 · 포스 그래프) |
| **마크다운 렌더링** | react-markdown + remark-gfm |
| **AI 연동** | Anthropic SDK (BYOK) |
| **아이콘** | Lucide React |
| **배포** | GitHub Pages + GitHub Actions |

---

## 🚀 로컬에서 실행하기

```bash
# 1. 클론
git clone https://github.com/Dev-2A/diary-of-claude.git
cd diary-of-claude

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 빌드 (프로덕션)
npm run build
```

---

## 📖 사용 방법

### 1) API 키 등록
1. [Anthropic Console](https://console.anthropic.com/settings/keys) 에서 API 키 발급
2. 앱의 **설정** 페이지에서 키 등록
3. 분석 모델 선택 (Haiku 4.5 추천 — 대량 분석 시 속도·비용 유리)

### 2) 대화 데이터 가져오기

**옵션 A — Claude 공식 export (추천)**
1. https://claude.ai/ 접속 → 설정 → Privacy → Export data
2. 이메일로 받은 `.zip` 파일 압축 해제
3. `conversations.json` 파일을 앱의 **아카이브** 페이지에 드래그 업로드

**옵션 B — 마크다운 수동 작성**

```text
Title: 대화 제목
H: 사람의 메시지
A: Claude의 메시지
```

형식으로 `.md` 파일 작성 후 업로드.

### 3) 자동 분석
아카이브 페이지의 **전체 분석 시작** 버튼 → 모든 대화에 카테고리·태그·요약이 자동 부착됨.

### 4) 탐색
- **통계** 페이지: 시각화 3종
- **검색** 페이지: 다중 조건 검색
- **내보내기** 페이지: 원하는 포맷으로 출력

---

## 🎨 스크린샷

> 실제 사용 화면은 [Live Demo](https://dev-2a.github.io/diary-of-claude/) 에서 확인할 수 있어요.

---

## 🧭 프로젝트 구조

```text
src/
├── components/
│   ├── common/        # Button, Card, FileDropzone 등 공통 컴포넌트
│   ├── layout/        # Header, Sidebar, BottomNav
│   └── charts/        # D3.js 시각화 (히트맵 · 스트림 · 포스 그래프)
├── pages/             # Home, Archive, Detail, Stats, Search, Export, Settings
├── services/          # Claude 파서, 분석 엔진, 유사도 엔진, 내보내기
├── db/                # Dexie 스키마 + CRUD 레이어
├── hooks/             # useApiKey, useAnalyzer, useSimilarityEngine 등
├── contexts/          # ApiKeyContext
├── utils/             # 날짜 집계, 카테고리 트렌드, 포맷팅
└── constants/         # 라우트, 모델, 테마
```

---

## 🔒 보안 & 프라이버시

- **데이터 위치**: 브라우저 IndexedDB (`DiaryOfClaudeDB`)
- **외부 전송**: Anthropic API 호출 시 분석 대상 대화만 전송 (BYOK 키 사용)
- **API 키 저장**: 브라우저 로컬에만 저장 (IndexedDB `settings` 테이블)
- **로그 수집**: 없음. 트래킹 스크립트 없음. 애널리틱스 없음.

공용 PC에서 사용 후 설정 페이지의 **"키 삭제"** 및 브라우저 데이터 삭제를 권장합니다.

---

## 🛤️ 로드맵

### v0.1.0 (현재)
- [x] Claude JSON/Markdown 파서
- [x] IndexedDB 기반 로컬 저장
- [x] Claude API 자동 태깅·분류·요약 (BYOK)
- [x] 활동 히트맵 · 월별 관심사 스트림그래프 · 대화 간 유사도 포스 그래프
- [x] 다중 조건 통합 검색
- [x] Markdown · JSON · Notion · GitHub Issue 내보내기
- [x] 완전 로컬 처리 + 반응형 UI + GitHub Pages 배포

### 아이디어 풀 (미구현)
- [ ] 대화 간 스니펫 추출 (자주 재활용하는 코드/답변 자동 발견)
- [ ] 시간대별 대화 패턴 히트맵 (요일 × 시간)
- [ ] 외부 임베딩 API 연동으로 본격 의미 기반 유사도
- [ ] 대화 병합 / 일부만 추출해서 내보내기
- [ ] PWA 변환 (오프라인 지원)

---

## 🤝 기여

버그 제보나 아이디어는 [Issues](https://github.com/Dev-2A/diary-of-claude/issues) 에 남겨주세요.

---

## 📜 라이선스

MIT © 2026 [Dev-2A](https://github.com/Dev-2A)

---

## 🔗 시리즈

취미 아카이빙 시리즈:

1. **[BookShelf.log](https://github.com/Dev-2A/bookshelf-log)** — 읽은 책 아카이브
2. **[Backlog Radio](https://github.com/Dev-2A/backlog-radio)** — 플레이할 게임 큐
3. **Diary of Claude** — 나눈 대화 아카이브 ← *현재 작품*
