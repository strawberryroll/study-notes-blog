# ROADMAP: 강의 복습 노트 블로그 — 관리자 레이아웃 도입 (v3)

> 작성일: 2026-08-12
> 선행 문서: [PRD](./PRD.md), [MVP 로드맵(v1)](./roadmaps/ROADMAP_v1.md), [고도화 로드맵(v2)](./roadmaps/ROADMAP_v2.md)
> 총 예상 소요 기간: **6~9일**
> **원칙: 각 Phase는 구현 완료 → 코드 품질 검증 → Playwright MCP 테스트 통과 → 다음 Phase 진행 순서를 반드시 지킨다.**

---

## 배경

MVP(v1)와 노트 상세 읽기 경험·Notion 콘텐츠 표현력 고도화(v2)가 완료되어 배포되었다. 지금까지는 방문자에게 보여지는 공개 페이지만 존재했고, Notion에서 작성한 노트의 상태(대기/초안/발행됨)를 확인하거나 관리하려면 Notion을 직접 열어야 했다. 이번 v3는 **관리자 전용 콘텐츠 관리 대시보드**를 신규 도입해, 노트 상태를 한눈에 보고 미리보기하고 발행을 즉시 반영할 수 있게 한다.

### 범위

- **포함**: 콘텐츠 관리 대시보드(상태별 조회), 노트 미리보기(미발행 포함), 발행 즉시 반영(수동 재검증), 최소 인증(비밀번호 게이트)
- **제외 (향후 후보로 이관)**: Notion write API 기반 직접 편집, 운영 통계/모니터링, 문의(Contact Form) 관리, Slack 알림 연동, Webhook 기반 자동 재검증

### 현재 상태 (구현 착수 전 확인된 사실)

- 인증/세션/미들웨어/API 라우트(`route.ts`) 코드가 프로젝트에 **전혀 없음** — 전부 신규 구현 필요.
- `src/lib/notion.ts` — `getCourses()`(cache 적용), `getNotes(databaseId)`(cache 미적용, `Status` 발행됨 필터 하드코딩), `getAdjacentNotes(databaseId, noteId)`(cache 미적용), `getNote(noteId)`(cache 적용, 필터 없이 단건 조회 — 미발행 노트도 조회 가능), 내부 `fetchBlockChildren`(재귀). Notion write API 사용처 없음(read-only).
- `src/app/layout.tsx`에 `Header`/`Footer`가 고정 배치되어 있어, 관리자 전용 레이아웃을 깨끗하게 분리하려면 라우트 그룹 이관이 필요하다.
- `src/components/common/notion-renderer.tsx`가 toggle/table/callout/bookmark/to_do 등 모든 블록을 지원하므로 미리보기 페이지에서 그대로 재사용 가능하다.
- shadcn/ui, Tailwind CSS 4, next-themes, sonner, `Container`(`src/components/layout/container.tsx`) 등 재사용 가능한 인프라가 이미 존재한다.
- 환경변수는 `NOTION_API_KEY`/`NOTION_DATABASE_ID`뿐이며 `.env.local.example` 파일이 없다. `revalidatePath`/`revalidateTag` 사용처도 없다.

---

## Phase 8: 인증 인프라 + 관리자 레이아웃 기반 (예상 2~3일)

### 작업 목록

- [x] **Notion Status 속성 확인** — 노트 DB의 `Status` 속성이 실제로 갖는 옵션 명칭(대기/초안/발행됨)을 Notion에서 재확인 — 사용자가 Notion에서 직접 확인: "대기", "초안", "발행됨" 세 옵션을 그대로 사용 중이며 코드상 필터(`"발행됨"`, `src/lib/notion.ts`)와 일치
- [x] **`(public)` 라우트 그룹 이관** — 기존 `src/app/page.tsx`, `src/app/courses/`를 `src/app/(public)/` 하위로 이동(URL 불변, git mv 기반)
  - `Header`/`Footer` 렌더링을 `src/app/(public)/layout.tsx`로 이동
  - Root `layout.tsx`는 폰트, `ThemeProvider`, `TooltipProvider`, `Toaster` 등 전역 요소만 남기고 슬림화
  - 기존 페이지의 실제 URL·동작은 변경되지 않아야 함 (회귀 위험이 가장 큰 작업이므로 Phase 8 최우선 배치)
  - 구현 중 `src/app/not-found.tsx`(라우트 그룹 밖 완전 미매칭 경로용)와 `(public)` 그룹 내부에서 `notFound()` 호출 시 Header/Footer가 이중 렌더링되는 문제를 발견해, `src/app/(public)/not-found.tsx`를 추가로 분리해 해결 (Playwright로 두 시나리오 모두 재검증 완료)
- [x] **비밀번호 게이트 인증** — 외부 인증 라이브러리 도입 없이 Web Crypto API 기반 구현
  - `src/lib/admin-auth.ts`: HMAC 서명 세션 토큰(`base64url(payload).base64url(signature)`, payload는 만료 타임스탬프만) 발급/검증. `crypto.subtle`로 Edge(`src/proxy.ts`)와 Node(Server Action) 양쪽에서 동일 코드 사용
  - 세션 서명 키는 비밀번호와 분리한 `ADMIN_SESSION_SECRET` 환경변수 사용 (비밀번호는 엔트로피가 약해 서명 키로 부적합)
  - 비밀번호 비교는 `crypto.timingSafeEqual`로 타이밍 공격 방지 (로그인 1회성, Server Action/Node 런타임에서 수행)
  - `src/proxy.ts`: `/admin/:path*` 가드, `/admin/login`은 예외 처리 — 계획 시점의 파일명은 `middleware.ts`였으나, 구현 중 Next.js 16.2.9부터 `middleware.ts` 파일 컨벤션이 deprecated되고 `proxy.ts`(export 함수명도 `middleware` → `proxy`)로 대체됨을 빌드 경고로 발견해 신규 컨벤션에 맞춰 구현
  - `.env.local.example` — *미완료: 프로젝트 훅(`pre-tool-use-hook.sh`)이 보호 파일로 지정해 자동 생성이 차단됨. 필요한 키(`NOTION_API_KEY`, `NOTION_DATABASE_ID`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`)를 사용자에게 안내했으며, 실제 `.env.local`에는 값이 직접 채워져 로그인 동작은 정상 확인됨*
- [x] **로그인/로그아웃** — `src/app/admin/login/page.tsx`, `src/app/admin/actions.ts`의 `loginAction`/`logoutAction` (Server Action, httpOnly 쿠키 세션)
  - 구현 중 `logoutAction`의 `cookies().delete()`가 `path`를 지정하지 않아 `path: "/admin"`으로 발급된 세션 쿠키가 삭제되지 않고 로그아웃 후에도 재접근이 가능한 보안 버그를 Playwright 검증 중 발견해 즉시 수정 (`delete({ name, path: "/admin" })`)
- [x] **관리자 레이아웃** — `src/app/admin/layout.tsx` + `src/components/admin/admin-nav.tsx` (대시보드/로그아웃 링크, `Container`와 `ThemeToggle` 재사용)

### 테스트 (Playwright MCP)

- [x] 미인증 상태로 `browser_navigate /admin` → `/admin/login?redirect=%2Fadmin`으로 리다이렉트 확인
- [x] 잘못된 비밀번호 입력 시 에러 메시지("비밀번호가 올바르지 않습니다.") 표시 확인
- [x] 올바른 비밀번호 입력 후 로그인 성공 → `redirect` 파라미터가 가리키는 `/admin` 대시보드 진입 확인
- [x] 로그아웃 클릭 → 세션 종료 후 `/admin` 재접근 시 다시 로그인 페이지로 리다이렉트되는지 확인 (쿠키 삭제 버그 발견 후 수정하여 최종 통과)
- [x] 기존 공개 페이지(`/`, `/courses/[courseId]`, `/courses/[courseId]/[noteId]`, `not-found`) 전체 회귀 없음 확인 — Header/Footer 정상 노출, 이중 렌더링 없음
- [x] 콘솔 에러 없음 확인 (Node.js `zlib.bytesRead` deprecation 경고 1건은 Next.js/Node 런타임 내부 이슈로 무관함을 확인)

### 완료 기준

- [x] `/admin` 하위 모든 경로가 인증 없이는 접근 불가
- [x] 올바른 비밀번호로 로그인 시 세션 쿠키가 발급되고 유지됨
- [x] 로그아웃 시 세션이 즉시 무효화됨
- [x] `(public)` 라우트 그룹 이관 후에도 기존 공개 페이지의 URL과 동작에 회귀 없음
- [x] 테스트 전 항목 통과 (Playwright MCP browser 도구 + curl 기반 HTTP 응답 검증 병행 — Chrome 확장 미연결로 순수 MCP browser 도구 대신 Playwright MCP를 사용)

### 이유

관리자 기능 전체가 인증 위에서 동작하므로 가장 먼저 견고한 인증 기반을 갖춰야 한다. 동시에 관리자 레이아웃을 공개 사이트와 분리하려면 기존 RootLayout 구조를 건드려야 하므로, 회귀 위험이 큰 이 작업을 초반에 끝내고 이후 Phase는 관리자 영역 안에서만 안전하게 확장한다.

---

## Phase 9: 대시보드 + 데이터 조회 확장 (예상 2~3일)

### 작업 목록

- [x] **관리자 전용 데이터 조회 함수** — 기존 `getNotes()`(공개 페이지에서 사용 중, 발행됨 필터 하드코딩)는 그대로 두고 `src/lib/notion.ts`에 함수 추가
  - `getNotesForAdmin(databaseId)`: 상태 필터 없이 전체 조회, `cache()` 적용
  - `getDashboardData()`: `getCourses()` + 강의별 `getNotesForAdmin()` 병렬 호출을 결합해 `{ course, notes }[]` 반환 (`CourseWithNotes` 타입 export)
- [x] **대시보드 페이지** — `src/app/admin/page.tsx`에서 `getDashboardData()` 호출
  - `src/components/admin/notes-table.tsx`: 강의별 그룹핑 테이블 (Client Component, `useState` 기반 로컬 필터링)
  - `src/components/admin/status-badge.tsx`: 대기/초안/발행됨 상태별 배지 색상 구분 (매핑에 없는 값은 outline + "미지정"으로 폴백)
  - 상태 필터(전체/대기/초안/발행됨) UI — shadcn `Tabs` 재사용

### 테스트 (Playwright MCP)

- [x] `browser_navigate /admin` → `browser_snapshot`으로 전체 강의×노트가 상태와 함께 표시되는지 확인 (TypeScript 2개, Next.js 4개 노트, 상태 배지 정상 표시)
- [x] 상태 필터 클릭 → 해당 상태의 노트만 표시되는지 확인 ("대기"/"발행됨" 탭 전환으로 검증)
- [x] 강의별 그룹핑이 올바르게 렌더링되는지 확인
- [x] 노트가 없는 강의의 빈 상태 처리 확인 — 실제 데이터가 전부 "발행됨" 상태라 "대기" 필터 선택 시 두 강의 모두 "노트가 없습니다" 안내 정상 표시
- [x] `browser_resize`로 375px / 768px / 1280px 레이아웃 확인 (Table의 자체 `overflow-x-auto` wrapper로 별도 구현 없이 반응형 확보)
- [x] `browser_console_messages`로 콘솔 에러 없음 확인 (Node.js `zlib.bytesRead` deprecation 경고 1건은 무관함을 재확인)

### 완료 기준

- [x] 대시보드에서 모든 강의의 모든 상태(대기/초안/발행됨) 노트가 조회됨
- [x] 상태 필터와 강의별 그룹핑이 정상 동작
- [x] 기존 `getNotes()`를 사용하는 공개 페이지 동작에 회귀 없음 (시그니처 불변, 빌드 라우트 표로 재확인)
- [x] 375px / 768px / 1280px 모두에서 레이아웃 정상
- [x] Playwright 테스트 전 항목 통과

### 이유

관리자가 Notion을 직접 열지 않고도 전체 콘텐츠의 발행 상태를 파악할 수 있어야 이번 v3의 핵심 목적(콘텐츠 관리 대시보드)이 성립한다. 기존 공개용 데이터 조회 함수를 변경하지 않고 별도 함수로 확장해 회귀 위험을 최소화한다.

---

## Phase 10: 노트 미리보기 + 즉시 재검증 (예상 2~3일)

### 작업 목록

- [x] **노트 미리보기** — `src/app/admin/courses/[courseId]/[noteId]/page.tsx`
  - 기존 `getNote()` + `notion-renderer.tsx`를 그대로 재사용 (발행 여부 무관하게 조회 가능)
  - `dynamic = "force-dynamic"`으로 캐싱 없이 항상 최신 상태 표시
  - 상태 배지(`StatusBadge` 재사용) + Alert 기반 "관리자 미리보기" 안내 배너로 공개 페이지와 시각적으로 구분
  - 발행됨 상태인 경우 실제 공개 URL로 이동하는 링크 추가
  - `admin/layout.tsx`가 이미 `Container`로 감싸고 있어 미리보기 페이지 자체에는 `Container`를 중복 사용하지 않음
- [x] **즉시 재검증** — Notion Webhook 대신 관리자가 버튼을 눌러 트리거하는 수동 방식
  - `src/app/admin/actions.ts`: `revalidateNoteAction(courseId, noteId)`, `revalidateCourseAction(courseId)` (Server Action, `revalidatePath` 사용)
  - `src/components/admin/revalidate-button.tsx`: `action: () => Promise<void>` prop 하나만 받는 범용 버튼(`useTransition` + `sonner` toast로 완료 알림) — Server Action `.bind()` 패턴으로 노트/강의 재검증 양쪽에 재사용 가능하게 설계
  - 대시보드 테이블(`notes-table.tsx`) 각 행에 "작업" 컬럼으로 미리보기 링크와 재검증 버튼 배치 — 단, 실제 UI에는 노트 단위 재검증(`revalidateNoteAction`)만 연결했고 강의 단위 일괄 재검증(`revalidateCourseAction`) 버튼은 이번 범위에서 대시보드에 노출하지 않음(함수는 재사용 가능하도록 존재)

### 테스트 (Playwright MCP)

- [x] 미발행(대기/초안) 노트도 관리자 미리보기 페이지에서 정상 렌더링되는지 확인 — 코드 경로상 `getNote()`가 상태 필터 없이 조회하므로 검증됨(실제 데이터가 현재 전부 발행됨 상태라 발행됨 노트로 실측, 미발행 케이스는 로직상 동일 경로)
- [x] 미리보기 페이지에 공개 페이지와 구분되는 배너/배지가 표시되는지 확인 (Alert "관리자 미리보기" + StatusBadge 정상 렌더링 확인)
- [x] 재검증 버튼 클릭 → toast로 완료 알림 확인 ("재검증되었습니다." 토스트 표시 확인)
- [x] `browser_console_messages`로 콘솔 에러 없음 확인
- [x] 재검증 후 해당 공개 페이지를 새로고침했을 때 60초(ISR 주기) 대기 없이 최신 콘텐츠가 반영되는지 확인 — 사용자가 Notion에서 실제 콘텐츠를 수정한 뒤 재검증 버튼으로 즉시 반영됨을 수동으로 직접 확인

### 완료 기준

- [x] 미발행 노트를 포함한 모든 노트를 관리자 페이지에서 미리볼 수 있음
- [x] 재검증 버튼으로 해당 강의/노트/홈 경로가 즉시 갱신됨 (`revalidatePath` 호출 성공 및 실콘텐츠 변경 반영을 사용자가 수동으로 확인 완료)
- [x] Playwright 테스트 전 항목 통과

### 이유

Notion에서 상태를 "발행됨"으로 바꾼 직후 ISR 60초를 기다리지 않고 바로 확인하려는 요구를 Webhook 없이 충족한다. 관리자가 이미 대시보드를 열어 상태를 확인하는 능동적 흐름이 전제이므로, Webhook 인프라의 복잡도 없이 버튼 클릭만으로 목적을 달성한다.

---

## 전체 일정 요약

| Phase | 내용 | 예상 소요일 | 누적 소요일 |
|-------|------|------------|------------|
| Phase 8 | 인증 인프라 + 관리자 레이아웃 기반 | 2~3일 | 2~3일 |
| Phase 9 | 대시보드 + 데이터 조회 확장 | 2~3일 | 4~6일 |
| Phase 10 | 노트 미리보기 + 즉시 재검증 | 2~3일 | 6~9일 |

---

## 테스트 원칙

- 모든 테스트는 **Playwright MCP** 도구를 사용한다
- 주요 도구: `browser_navigate`, `browser_snapshot`, `browser_click`, `browser_fill_form`, `browser_evaluate`, `browser_resize`, `browser_take_screenshot`, `browser_console_messages`, `browser_press_key`
- **구현 완료 → 코드 품질 검증 → Playwright 테스트 수행 → 통과 확인 → 다음 Phase 진행** 순서를 반드시 지킨다

### 코드 품질 검증 (매 기능 구현 직후, Playwright 테스트 이전)

각 작업 목록 항목(또는 의미 있는 단위의 구현)을 마칠 때마다 다음 항목을 **순서대로** 확인한다. 하나라도 실패하면 다음 단계로 넘어가지 않고 즉시 원인을 수정한다.

1. `pnpm lint` — ESLint 규칙 위반 없음
2. `tsc --noEmit` — TypeScript 타입 에러 없음 (또는 `pnpm build`로 타입 체크까지 함께 확인)
3. `pnpm build` — 프로덕션 빌드 성공

(Prettier는 설치되어 있지 않으므로 포맷 검증은 대상에서 제외한다.)

---

## 의존 관계

```
Phase 8 (인증/레이아웃) → Phase 9 (대시보드) → Phase 10 (미리보기/재검증)
```

세 Phase 모두 `src/app/admin/` 하위와 `src/lib/notion.ts`를 공유하므로 순차 진행을 권장한다. 특히 Phase 8의 `(public)` 라우트 그룹 이관은 기존 공개 페이지 전체에 영향을 주므로 반드시 가장 먼저 완료하고 회귀 검증을 마친 뒤 Phase 9로 넘어간다.

---

## 향후 후보 (이번 v3 범위 밖)

우선순위 논의 시 참고용으로 남겨둔다.

- Notion write API 기반 콘텐츠 직접 편집 (관리자 화면에서 글 작성/수정)
- 운영 통계/모니터링 대시보드 (조회수, 인기 노트, Notion API 상태 등)
- 문의(Contact Form) 관리 — 현재 `contact-form.tsx`는 실제 전송 로직 없는 목업 상태
- Slack 알림 연동 — `SLACK_WEBHOOK_URL` 환경변수가 이미 존재하나 코드와 연결되지 않은 상태
- Notion Webhook 기반 완전 자동 재검증 (수동 트리거 대체)
- 관리자 계정 다중화 (현재는 1인 비밀번호 게이트 전제)
