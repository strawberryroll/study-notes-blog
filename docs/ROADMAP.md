# ROADMAP: 강의 복습 노트 블로그 (Notion CMS 기반)

> PRD 기준 작성일: 2026-06-19  
> 총 예상 소요 기간: **9~14일**  
> **원칙: 각 Phase는 구현 완료 → Playwright MCP 테스트 통과 → 다음 Phase 진행 순서를 반드시 지킨다.**

---

## Phase 1: 프로젝트 초기 설정 (예상 1~2일)

### 작업 목록

- [x] Next.js 15 (App Router) + TypeScript 프로젝트 구조 확인 및 정리
- [x] `pnpm add @notionhq/client` 패키지 설치
- [x] Notion Integration 생성 및 API 키 발급
- [x] 강의 목록 DB / 강의별 노트 DB를 Integration에 연결
- [x] `.env.local` 환경 변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
- [x] 기본 레이아웃 구조 생성 (Header, Footer, Container)

### 테스트 (Playwright MCP)

- `pnpm dev` 기동 후 `browser_navigate`로 `http://localhost:3000` 접속 → 200 응답 확인
- `browser_snapshot`으로 Header / Footer 렌더링 확인
- `browser_console_messages`로 콘솔 에러 없음 확인

### 완료 기준

- `pnpm dev` 에러 없이 기동
- Notion API 키로 강의 목록 DB 호출 시 데이터 정상 반환
- `.env.local`의 두 환경 변수 모두 설정 완료
- Playwright 테스트 전 항목 통과

### 이유

견고한 기반 없이는 기능 개발이 어렵다. Notion API 연동이 검증되지 않은 상태로 UI 개발을 진행하면 나중에 데이터 구조 불일치로 대규모 수정이 발생할 수 있다.

---

## Phase 2: 공통 모듈 개발 (예상 2~3일)

### 작업 목록

- [ ] `src/lib/notion.ts` — Notion 클라이언트 초기화 및 공통 API 함수 구현
  - `getCourses()`: 강의 목록 DB 전체 조회
  - `getNotes(databaseId)`: 특정 강의의 `Status === "발행됨"` 노트 목록 조회 (Published 내림차순, `대기`/`초안` 제외)
  - `getNote(noteId)`: 노트 상세 페이지 블록 콘텐츠 조회
- [ ] 공통 타입 정의 (`Course`, `Note`, `NotionBlock` 등)
- [ ] 공통 컴포넌트 기초 구현
  - `src/components/layout/header.tsx`
  - `src/components/layout/footer.tsx`
  - `src/components/layout/container.tsx`

### 테스트 (Playwright MCP) — API 연동이 핵심이므로 꼼꼼히 검증

- `browser_navigate /` 접속 후 `browser_snapshot`으로 강의 카드 데이터 로드 확인
- `getCourses()` 반환값이 비어있지 않은지 확인 (빈 배열이면 API 키·DB ID 재확인)
- `getNotes(databaseId)` — `Status=발행됨` 필터 정상 동작 확인 (초안 글이 노출되지 않는지)
- `browser_console_messages`로 각 API 호출 시 콘솔 에러 없음 확인

### 완료 기준

- `getCourses()`, `getNotes()`, `getNote()` 세 함수가 실제 Notion 데이터를 반환
- TypeScript 타입 에러 없이 `pnpm build` 통과
- Header / Footer가 모든 페이지에 공통 적용
- Playwright 테스트 전 항목 통과

### 이유

모든 페이지에서 재사용되는 API 함수와 타입을 먼저 정의해야 이후 중복 코드를 방지하고 일관된 데이터 구조를 유지할 수 있다.

---

## Phase 3: 핵심 기능 개발 (예상 3~4일)

### 작업 목록

- [ ] 홈 페이지 (`src/app/page.tsx`) — 강의 목록 카드 레이아웃
  - `src/components/common/course-card.tsx`: 썸네일, 강의명, 한 줄 설명 표시
- [ ] 노트 목록 페이지 (`src/app/courses/[courseId]/page.tsx`)
  - `src/components/common/note-card.tsx`: 제목, 태그, 작성일 표시
- [ ] 노트 상세 페이지 (`src/app/courses/[courseId]/[noteId]/page.tsx`)
  - `src/components/common/notion-renderer.tsx`: Notion 블록 → React 컴포넌트 렌더러
  - MVP 지원 블록: 단락, 헤딩(H1–H3), 불릿 목록, 번호 목록, 코드 블록, 인용, 구분선, 이미지

### 테스트 (Playwright MCP) — 페이지별 골든 패스 검증

- **홈**: `browser_navigate /` → `browser_snapshot`으로 강의 카드 목록 확인, 카드 클릭 시 `/courses/[courseId]`로 이동 확인
- **노트 목록**: `browser_navigate /courses/[courseId]` → 노트 목록 표시, 최신순 정렬 확인, `발행됨` 아닌 글 미노출 확인
- **노트 상세**: `browser_navigate /courses/[courseId]/[noteId]` → 제목·태그·작성일 표시, 본문 블록(헤딩, 코드, 이미지 등) 렌더링 확인
- `browser_console_messages`로 각 페이지 콘솔 에러 없음 확인
- 미지원 블록이 있을 경우 에러 없이 스킵되는지 확인

### 완료 기준

- `/` 진입 시 Notion 강의 목록 DB의 강의 카드가 정상 표시
- `/courses/[courseId]` 진입 시 해당 강의의 `발행됨` 노트 목록이 최신순으로 표시
- `/courses/[courseId]/[noteId]` 진입 시 Notion 본문 블록이 올바르게 렌더링
- 지원하지 않는 블록 타입은 에러 없이 무시(스킵)
- Playwright 테스트 전 항목 통과

### 이유

블로그의 핵심 가치인 "Notion 노트를 웹에서 읽는다"는 흐름을 먼저 완성해야 한다. 이 기능이 동작하지 않으면 나머지 기능은 의미가 없다.

---

## Phase 4: 추가 기능 개발 (예상 2~3일)

> Phase 3 완료 후 진행. MVP 외 항목으로, 일정에 따라 생략 또는 후순위 조정 가능.

### 작업 목록

- [ ] 태그 필터링 — 노트 목록 페이지에서 `Tags` 기준으로 필터
- [ ] 검색 기능 — 노트 제목 기준 클라이언트 사이드 검색
- [ ] SEO 최적화
  - 각 페이지에 `generateMetadata` 적용 (`<title>`, `<meta description>`, Open Graph)
  - 이미지 `alt` 텍스트 필수화
- [ ] 접근성 — 키보드 네비게이션, 포커스 트랩 점검

### 테스트 (Playwright MCP)

- **태그 필터**: `browser_click`으로 특정 태그 선택 → `browser_snapshot`으로 해당 태그 노트만 표시되는지 확인
- **검색**: `browser_fill_form`으로 검색어 입력 → 실시간 필터링 결과 확인
- **SEO**: `browser_evaluate`로 `document.title`, `meta[name="description"]` 값 확인
- **접근성**: `browser_press_key`로 Tab 키 네비게이션 동작 확인

### 완료 기준

- 태그 클릭 시 해당 태그의 노트만 필터링되어 표시
- 검색창에 키워드 입력 시 노트 제목이 실시간으로 필터링
- 브라우저 탭 제목과 OG 미리보기가 페이지별로 올바르게 표시
- 키보드만으로 전체 페이지 탐색 가능
- Playwright 테스트 전 항목 통과

### 이유

핵심 기능이 완성된 후 사용성과 검색 유입을 높이는 부가 기능을 추가한다. SEO는 Vercel 배포 전에 반드시 적용해야 효과가 있으므로 배포 직전 단계에 위치한다.

---

## Phase 5: 최적화 및 배포 (예상 1~2일)

### 작업 목록

- [ ] ISR 설정 — 각 페이지에 `revalidate = 60` 적용
- [ ] Notion API 오류 처리 — 빈 목록 또는 에러 페이지(`error.tsx`, `not-found.tsx`) 구현
- [ ] 반응형 디자인 점검 (375px / 768px / 1280px 브레이크포인트)
- [ ] 모바일 햄버거 메뉴 동작 확인
- [ ] Vercel 환경 변수 설정 (`NOTION_API_KEY`, `NOTION_DATABASE_ID`)
- [ ] Vercel 배포 및 프로덕션 동작 검증

### 테스트 (Playwright MCP)

- **반응형**: `browser_resize`로 375px / 768px / 1280px 뷰포트 전환 후 `browser_take_screenshot`으로 레이아웃 확인
- **모바일 메뉴**: 375px에서 햄버거 아이콘 `browser_click` → 메뉴 펼침 확인
- **에러 처리**: 존재하지 않는 경로(`/courses/invalid-id`) 접속 → `not-found.tsx` 노출 확인
- **프로덕션**: Vercel 배포 URL로 `browser_navigate` 후 전체 페이지 smoke test

### 완료 기준

- Vercel 프로덕션 URL에서 모든 페이지가 정상 로드
- Notion에서 글을 `발행됨`으로 변경 후 최대 60초 내에 블로그에 반영
- 모바일(375px) / 태블릿(768px) / 데스크톱(1280px) 화면에서 레이아웃이 깨지지 않음
- Notion API 오류 발생 시 사용자에게 적절한 에러 메시지 표시
- Playwright 테스트 전 항목 통과

### 이유

기능이 완성된 후 실제 사용 환경에서의 성능과 안정성을 확보한다. ISR을 통해 매 요청마다 Notion API를 호출하지 않아 응답 속도와 비용을 최적화한다.

---

## 전체 일정 요약

| Phase | 내용 | 예상 소요일 | 누적 소요일 |
|-------|------|------------|------------|
| Phase 1 | 프로젝트 초기 설정 | 1~2일 | 1~2일 |
| Phase 2 | 공통 모듈 개발 | 2~3일 | 3~5일 |
| Phase 3 | 핵심 기능 개발 | 3~4일 | 6~9일 |
| Phase 4 | 추가 기능 개발 | 2~3일 | 8~12일 |
| Phase 5 | 최적화 및 배포 | 1~2일 | 9~14일 |

---

## 테스트 원칙

- 모든 테스트는 **Playwright MCP** 도구를 사용한다
- 주요 도구: `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill_form`, `browser_evaluate`, `browser_resize`, `browser_take_screenshot`, `browser_console_messages`, `browser_press_key`
- API 연동(Phase 2)과 비즈니스 로직(Phase 3) 단계는 특히 꼼꼼히 검증한다
- **구현 완료 → 테스트 수행 → 통과 확인 → 다음 Phase 진행** 순서를 반드시 지킨다

---

## 의존 관계

```
Phase 1 (환경) → Phase 2 (공통 모듈) → Phase 3 (핵심 기능) → Phase 4 (추가 기능) → Phase 5 (배포)
```

Phase 3 페이지 구현과 SEO 메타 태그 작업(Phase 4 일부)은 병행 가능하나, 각 Phase의 Playwright 테스트 통과가 선행되어야 한다.
