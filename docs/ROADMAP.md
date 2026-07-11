# ROADMAP: 강의 복습 노트 블로그 — 고도화 (v2)

> 작성일: 2026-07-07
> 선행 문서: [PRD](../docs/PRD.md), [MVP 로드맵(v1)](./roadmaps/ROADMAP_v1.md)
> 총 예상 소요 기간: **6~9일**
> **원칙: 각 Phase는 구현 완료 → 코드 품질 검증 → Playwright MCP 테스트 통과 → 다음 Phase 진행 순서를 반드시 지킨다.**

---

## 배경

MVP(v1 로드맵 Phase 1~5)는 완료되어 Vercel에 배포되었다. 강의 목록/노트 목록/노트 상세 조회, 태그 필터, 검색, SEO, ISR, 반응형까지 핵심 흐름은 갖춰졌다. 이번 v2는 **노트 상세 페이지의 읽기 경험**과 **Notion 콘텐츠 표현력**을 중심으로 고도화한다.

### 대상 파일 (현재 구조 기준)

- `src/lib/notion.ts` — `getCourses()` / `getNotes(databaseId)` / `getNote(noteId)`
- `src/components/common/notion-renderer.tsx` — Notion 블록 렌더러 (현재 8종 블록 지원: 단락, H1-H3, 불릿/번호 목록, 코드, 인용, 구분선, 이미지)
- `src/app/courses/[courseId]/[noteId]/page.tsx` — 노트 상세 페이지

---

## Phase 6: 노트 상세 읽기 경험 개선 (예상 2~3일)

### 작업 목록

- [x] **목차(TOC)** — `notion-renderer.tsx`가 렌더링하는 `heading_1`/`heading_2`/`heading_3` 블록을 기반으로 목차 컴포넌트 생성
  - `src/components/common/table-of-contents.tsx` (신규, Client Component)
  - 각 heading에 `id` 부여 — 텍스트 slugify 대신 Notion `block.id`(전역 고유 UUID)를 그대로 DOM id로 사용해 중복/인코딩 문제 원천 차단 (`extractHeadings` 함수를 `notion-renderer.tsx`에서 export)
  - `IntersectionObserver`로 현재 스크롤 위치의 섹션 하이라이트 (문서 마지막 heading 근처에서 하이라이트가 이전 섹션에 머무르는 경미한 엣지케이스 있음 — 후속 개선 후보)
  - 데스크톱: 본문 우측 sticky 사이드바 / 모바일·태블릿: shadcn `Accordion` 기반 접이식 (반응형 대응 완료, 375/768/1280px Playwright 검증)
- [x] **이전/다음 노트 네비게이션** — 노트 상세 페이지 하단에 같은 강의 내 이전글/다음글 링크
  - `src/lib/notion.ts`에 `getAdjacentNotes(databaseId, noteId)` 추가, 기존 `getNotes(databaseId)` 재사용해 현재 노트의 인덱스 계산
  - 정렬 기준은 기존 `getNotes`와 동일하게 `Published` 내림차순 유지
  - 첫 글/마지막 글일 때는 해당 방향 링크 비노출 (Playwright로 확인)
  - `src/components/common/note-pagination.tsx` (신규, Server Component)

### 테스트 (Playwright MCP)

- `browser_navigate /courses/[courseId]/[noteId]` → `browser_snapshot`으로 목차 렌더링 확인 (heading 개수와 목차 항목 수 일치)
- `browser_click`으로 목차 항목 클릭 → 해당 섹션으로 스크롤 이동 확인
- 스크롤 후 `browser_snapshot`으로 현재 섹션 하이라이트 반영 확인
- 이전/다음 노트 링크 클릭 → 올바른 노트로 이동 확인
- 목록의 첫 번째/마지막 노트에서 각각 다음/이전 링크가 없는지 확인
- `browser_resize`로 375px 뷰포트 전환 후 목차 레이아웃이 깨지지 않는지 확인
- `browser_console_messages`로 콘솔 에러 없음 확인

### 완료 기준

- heading이 있는 노트에서 목차가 정확히 표시되고 클릭 시 해당 섹션으로 이동
- 스크롤에 따라 현재 위치가 목차에 반영됨
- 노트 상세 페이지 하단에 이전/다음 노트 링크가 정렬 순서에 맞게 표시
- 375px / 768px / 1280px 모두에서 레이아웃 정상
- Playwright 테스트 전 항목 통과

### 이유

노트 콘텐츠가 길어질수록 목차 없이는 원하는 섹션을 찾기 어렵고, 강의를 순서대로 복습하는 사용 패턴상 이전/다음 네비게이션이 있어야 노트 목록으로 돌아가지 않고도 연속해서 읽을 수 있다.

---

## Phase 7: Notion 콘텐츠 표현력 확대 (예상 3~4일)

### 작업 목록

- [x] **Notion 블록 지원 확대** — `notion-renderer.tsx`의 `NotionBlock` switch 문에 케이스 추가
  - `toggle` (네이티브 `<details>/<summary>`, 각 toggle이 독립적으로 열림/닫힘, 재귀 렌더링으로 중첩 toggle도 지원)
  - `table` / `table_row` (신규 설치한 shadcn `Table` 컴포넌트 사용, `has_column_header` 기준으로 헤더 행 분리)
  - `callout` (이모지 아이콘 + `bg-muted` 배경 박스, 자식 블록 재귀 렌더링 지원)
  - `bookmark` (기존 `Card` 재사용한 URL 카드, 새 탭 링크)
    - **OG(Open Graph) 메타데이터 자동 파싱** (후속 작업, 완료): `src/lib/link-preview.ts`에서 대상 URL을 fetch해 `og:title`/`og:description`/`og:image`/`og:site_name`을 정규식으로 추출(신규 HTML 파서 의존성 추가 없음), 7일 캐싱(`next: { revalidate }`)과 5초 타임아웃(`AbortSignal.timeout`)·2MB 응답 상한 적용 — 실측 중 YouTube처럼 `<head>`가 500KB를 넘는 대형 사이트가 있어 상한을 2MB로 조정, HTML 엔티티(`&quot;`/`&amp;` 등) 미디코딩 문제도 발견해 경량 디코딩 로직 추가
    - `BookmarkCard`(Server, `src/components/common/bookmark-card.tsx`)를 `Suspense`로 감싸 외부 사이트 응답이 느려도 노트 본문 로딩을 막지 않음 — fallback은 기존 최소 카드(`MinimalBookmarkCard`)
    - OG 이미지는 임의 외부 도메인이라 `next/image`의 `remotePatterns` 화이트리스트가 맞지 않아 순수 `<img>` 기반 `LinkPreviewImage`(Client, `notion-image.tsx`와 동일한 loaded/error 패턴) 사용
    - 모든 실패 케이스(URL 무효, 타임아웃, HTTP 에러, OG 태그 없음, DNS 실패 등)는 `null` 반환으로 흡수해 기존 최소 링크 카드로 안전하게 폴백 (Playwright로 `example.com`/존재하지 않는 도메인 실제 검증 완료)
  - `to_do` (체크 여부에 따라 `Square`/`SquareCheck` 아이콘 + 취소선, 인접 항목은 하나의 목록으로 그룹핑)
  - **자식 블록 재귀 조회**: `lib/notion.ts`에 `fetchBlockChildren`/`BlockWithChildren` 타입 추가, `@notionhq/client`의 `collectPaginatedAPI` 헬퍼로 페이지네이션 자동 처리, `has_children`인 모든 블록을 무한 깊이로 재귀 조회 (toggle 안에 toggle이 있는 중첩 구조도 대응, Playwright로 열림/닫힘 검증 완료)
  - `extractHeadings`도 재귀 스캔으로 확장해 toggle/callout 내부 heading까지 목차에 반영
  - 색상(`ApiColor`)은 매핑하지 않고 고정 배경만 사용 — 범위 밖으로 확정
- [ ] **코드 블록 문법 강조** — 코드 블록에 syntax highlighting 적용 (이번 Phase 7 범위에서 제외, 별도 후속 작업으로 분리)
  - `shiki` 도입 검토 (서버 컴포넌트에서 빌드 타임/요청 타임 하이라이팅 가능, 번들 크기 영향 적음)
  - Notion 코드 블록의 `language` 필드를 매핑해 하이라이팅 언어 결정
  - 다크모드 대응: 라이트/다크 테마 모두 대비되는 색상 세트 사용 (`globals.css`의 OKLCH 테마 변수와 조화)
- [x] **이미지 최적화** — `notion-image.tsx` 신규 Client Component로 분리 (onLoad/onError 이벤트 핸들러 때문에 이미지만 client 경계)
  - 로딩 중에는 기존 `bg-muted` 배경이 placeholder 역할을 하고, `onLoad` 시 opacity 트랜지션으로 자연스럽게 표시
  - 에러(깨진 URL) 시 `ImageOff` 아이콘 + 안내 문구로 대체, 페이지 전체가 깨지지 않음 (Playwright로 확인)
  - `next/image`에 `sizes` prop 추가 (본문 레이아웃 기준 추정치)
  - 자체 프록시 라우트(`/api/image-proxy`)는 범위 밖으로 확정, `next/image` 옵션 개선 수준까지만 진행
  - `alt` 텍스트 누락 시 기본값 처리 로직은 이미 있음(`"노트 이미지"`) — 유지

### 테스트 (Playwright MCP)

- toggle/table/callout/bookmark/to_do 블록이 포함된 테스트 노트로 `browser_navigate` → `browser_snapshot`으로 각 블록 정상 렌더링 확인
- toggle 블록 `browser_click`으로 펼침/접힘 동작 확인
- 코드 블록에 언어별(`javascript`, `python` 등) 문법 강조 색상이 적용되는지 `browser_snapshot`/`browser_evaluate`로 확인
- 다크모드 토글 후 코드 블록 대비가 유지되는지 확인
- 이미지 블록 로딩 중 placeholder 표시 확인, 로딩 완료 후 정상 이미지 표시 확인
- 미지원 블록(위 목록에 없는 타입)이 있어도 에러 없이 스킵되는지 재확인 (기존 회귀 방지)
- `browser_console_messages`로 콘솔 에러 없음 확인

### 완료 기준

- toggle, table, callout, bookmark, to_do 블록이 노트 상세 페이지에서 정상 렌더링
- 코드 블록이 언어에 맞는 문법 강조로 표시되고 라이트/다크 모드 모두 가독성 확보
- 이미지가 만료되거나 로딩이 느려도 페이지 전체가 깨지지 않고 placeholder로 대응
- 기존 8종 블록 렌더링에 회귀 없음
- Playwright 테스트 전 항목 통과

### 이유

강의 노트는 코드와 표, 체크리스트 등 다양한 형태로 작성되는 경우가 많아, MVP의 8종 블록만으로는 실제 Notion 노트의 상당 부분이 누락되어 보일 수 있다. 코드 문법 강조는 강의 노트 특성상 가장 체감 효과가 큰 개선이다.

---

## 전체 일정 요약

| Phase | 내용 | 예상 소요일 | 누적 소요일 |
|-------|------|------------|------------|
| Phase 6 | 노트 상세 읽기 경험 개선 (목차, 이전/다음 네비게이션) | 2~3일 | 2~3일 |
| Phase 7 | Notion 콘텐츠 표현력 확대 (블록 확대, 코드 강조, 이미지 최적화) | 3~4일 | 5~7일 |

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
Phase 6 (읽기 경험) → Phase 7 (콘텐츠 표현력)
```

Phase 6과 Phase 7은 서로 다른 파일(TOC/페이지네이션 vs. 블록 렌더러)을 주로 다루므로 병행 착수도 가능하나, 두 Phase 모두 `notion-renderer.tsx`와 노트 상세 `page.tsx`를 함께 건드리므로 병합 충돌을 피하려면 순차 진행을 권장한다.

---

## 향후 후보 (이번 v2 범위 밖)

우선순위 논의 시 참고용으로 남겨둔다.

- 전체 강의 통합 검색
- 관련 노트 추천 (태그 기반)
- RSS 피드
- 사이트맵 자동 생성
- Notion Webhook 기반 즉시 재검증 (ISR 60초 대체)
