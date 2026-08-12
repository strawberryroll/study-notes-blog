# PRD: 강의 복습 노트 블로그 (Notion CMS 기반)

## 1. 프로젝트 개요

| 항목 | 내용 |
|------|------|
| 프로젝트명 | 강의 복습 노트 블로그 |
| 목적 | 강의를 수강하며 정리한 복습 노트를 Notion에서 작성하고 블로그 형태로 공개 |
| 배포 환경 | Vercel |
| 작성일 | 2026-06-17 |

### 배경 및 목적

강의를 들으며 Notion에 복습 노트를 정리하고 있다. 이 노트를 별도의 배포 없이 블로그 형태로 공개하여, Notion에서 글을 작성하거나 수정하면 블로그에 자동으로 반영되도록 한다.

### CMS로 Notion을 선택한 이유

- 이미 Notion에서 강의 노트를 작성하고 있어 추가 도구 없이 연동 가능
- 강의별로 데이터베이스를 분리하여 콘텐츠 구조화 용이
- Notion 블록 기반 편집기로 코드, 이미지, 표 등 다양한 형태의 노트 작성 가능

---

## 2. 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 15 (App Router), TypeScript |
| CMS | Notion API (`@notionhq/client`) |
| Styling | Tailwind CSS 4, shadcn/ui |
| Icons | Lucide React |
| Deployment | Vercel |

---

## 3. Notion 데이터베이스 구조

강의별로 데이터베이스가 분리되어 있다. 강의 목록을 관리하는 메인 DB 1개와, 강의마다 노트를 관리하는 DB가 각각 존재한다.

### 강의 목록 DB (메인, 1개)

| 속성명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| `Title` | `title` | 강의 이름 | 필수 |
| `DatabaseId` | `rich_text` | 해당 강의의 노트 DB ID | 필수 |
| `Description` | `rich_text` | 강의 한 줄 설명 | 선택 |
| `Thumbnail` | `files` | 강의 썸네일 이미지 | 선택 |

### 강의별 노트 DB (강의당 1개)

| 속성명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| `Title` | `title` | 노트 제목 | 필수 |
| `Tags` | `multi_select` | 태그 목록 | 선택 |
| `Published` | `date` | 작성일 | 필수 |
| `Status` | `select` | 글 상태: `대기` / `초안` / `발행됨` | 필수 |
| `Content` | — | 본문 (Notion 페이지 블록) | 필수 |

> **API 조회 조건**: `Status === "발행됨"` 인 노트만 노출한다.

---

## 4. 주요 기능 요구사항

### 4-1. 강의 목록 조회

- 강의 목록 DB에서 전체 강의를 가져와 카드 형태로 표시한다.
- 카드에 표시할 정보: 강의 이름, 한 줄 설명, 썸네일.

### 4-2. 강의별 노트 목록

- 선택한 강의의 노트 DB에서 `Status = 발행됨`인 노트 목록을 가져온다.
- 기본 정렬: `Published` 내림차순 (최신순).
- 목록 항목에 표시할 정보: 노트 제목, 태그, 작성일.

### 4-3. 노트 상세 페이지

- Notion 페이지 ID를 URL slug로 사용한다.
- Notion 블록 콘텐츠를 렌더링한다.
- 지원 블록 타입 (MVP 범위): 단락, 헤딩(H1–H3), 불릿 목록, 번호 목록, 코드 블록, 인용, 구분선, 이미지.

### 4-4. 반응형 디자인

- 모바일(375px), 태블릿(768px), 데스크톱(1280px) 브레이크포인트 대응.
- 모바일에서 네비게이션은 햄버거 메뉴로 전환.

---

## 5. 화면 구성 (페이지 목록)

| 경로 | 페이지명 | 설명 |
|------|----------|------|
| `/` | 홈 | 강의 목록 카드 |
| `/courses/[courseId]` | 노트 목록 | 특정 강의의 노트 목록 |
| `/courses/[courseId]/[noteId]` | 노트 상세 | 개별 노트 본문 렌더링 |
| `/admin/login` | 관리자 로그인 | 비밀번호 게이트 |
| `/admin` | 관리자 대시보드 | 인증된 관리자 전용, 콘텐츠 관리 |

### 홈 (`/`)

- 강의 목록 (카드 레이아웃)
- 카드: 썸네일, 강의명, 한 줄 설명

### 노트 목록 (`/courses/[courseId]`)

- 강의명 헤더
- 노트 목록 (제목, 태그, 작성일)

### 노트 상세 (`/courses/[courseId]/[noteId]`)

- 노트 제목, 태그, 작성일 표시
- 본문 블록 렌더링

### 관리자 로그인 (`/admin/login`)

- 비밀번호 입력 폼 (단일 관리자 비밀번호 게이트)
- 인증 성공 시 원래 접근하려던 경로로 리다이렉트

### 관리자 대시보드 (`/admin`)

- 인증된 관리자만 접근 가능 (미인증 시 `/admin/login`으로 자동 리다이렉트)
- 콘텐츠 관리 화면 (상세는 [ROADMAP](./ROADMAP.md) Phase 9 참고)

---

## 6. 비기능 요구사항

| 항목 | 요구사항 |
|------|----------|
| 성능 | ISR(Incremental Static Regeneration) 적용, 재검증 주기 60초 |
| SEO | 페이지별 `<title>`, `<meta description>`, Open Graph 태그 설정 |
| 접근성 | 이미지 alt 텍스트 필수, 키보드 네비게이션 지원 |
| 에러 처리 | Notion API 오류 시 빈 목록 또는 에러 페이지 표시 |

---

## 7. MVP 범위

MVP에 포함되는 항목:

- [x] Notion API 연동 (`@notionhq/client`)
- [x] 강의 목록 페이지
- [x] 강의별 노트 목록 페이지
- [x] 노트 상세 페이지 (기본 블록 타입 렌더링)
- [x] 기본 스타일링 (Tailwind CSS + shadcn/ui)
- [x] 반응형 디자인

MVP에서 제외되는 항목:

- [ ] 검색 기능
- [ ] 댓글 기능
- [ ] RSS 피드
- [ ] 다국어 지원

---

## 7-1. 관리자 기능 (v3, MVP 이후 고도화) — 구현 완료

MVP 배포 이후 Notion 콘텐츠의 발행 상태를 웹에서 직접 확인·관리하기 위해 관리자 전용 영역(`/admin`)을 추가했다. Phase 8~10(인증/레이아웃, 대시보드, 미리보기/재검증)이 모두 구현 완료 및 Playwright 검증을 마쳤다. 상세 구현 단계는 [ROADMAP](./ROADMAP.md) 참고.

### 인증 방식

- 별도 사용자 계정 체계 없이 **단일 비밀번호 게이트**로 관리자 여부를 판별한다 (1인 운영 전제).
- 외부 인증 라이브러리(next-auth 등) 없이 Web Crypto API(`crypto.subtle`) 기반 HMAC 서명 세션 토큰을 자체 구현했다(`src/lib/admin-auth.ts`).
- 세션은 `httpOnly` 쿠키로 관리되며 만료 시간(TTL, 8시간) 경과 시 자동 무효화된다.
- `/admin` 하위 모든 경로는 `src/proxy.ts`(Next.js 16 미들웨어 컨벤션)에서 인증 여부를 검사해 미인증 접근을 `/admin/login`으로 리다이렉트한다.

### 공개 사이트에 관리자 진입점을 노출하지 않음 (의도된 설계)

- 홈/노트 목록/노트 상세 등 공개 페이지의 `Header`에는 로고와 다크모드 토글만 있으며, "관리자 로그인" 버튼이나 링크는 **의도적으로 두지 않는다**.
- 이유: 관리자는 사용자 본인 1명뿐이라 공개 방문자에게 로그인 진입점을 보여줄 필요가 없고, 오히려 노출하면 불필요한 공격 표면(비밀번호 대입 시도 등)만 늘어난다.
- 접근 방법: `/admin` URL을 직접 입력해 접근한다. 인증 안 된 상태로 접근하면 미들웨어가 자동으로 `/admin/login`으로 리다이렉트한다.
- 이 정책을 바꾸려면(예: Footer에 작은 관리자 링크 추가) 별도 논의가 필요하다.

### 관리자 화면 구성

| 경로 | 설명 |
|------|------|
| `/admin/login` | 비밀번호 입력 로그인 페이지 |
| `/admin` | 대시보드 — 전체 강의×노트를 상태별(대기/초안/발행됨)로 조회, 강의별 그룹핑, 상태 필터, 미리보기/재검증 액션 |
| `/admin/courses/[courseId]/[noteId]` | 노트 미리보기 — 발행 여부 무관하게 콘텐츠 확인, 발행됨 상태면 공개 페이지 링크 노출 |

### 범위

- **포함(v3, 구현 완료)**: 콘텐츠 상태(대기/초안/발행됨)별 조회, 미발행 노트 미리보기, 발행 즉시 반영(수동 재검증, `revalidatePath` 기반)
- **제외(향후 후보)**: Notion write API 기반 콘텐츠 직접 편집, 운영 통계/모니터링, 문의(Contact Form) 관리, 관리자 계정 다중화, 강의 단위 일괄 재검증 UI(함수는 존재하나 대시보드에 미노출)

---

## 8. 구현 단계

### Step 1. Notion API 설정

1. Notion Integration 생성 및 API 키 발급
2. `@notionhq/client` 패키지 설치
3. 강의 목록 DB 및 강의별 노트 DB를 Integration에 연결
4. `.env.local`에 환경 변수 설정

```bash
pnpm add @notionhq/client
```

```env
NOTION_API_KEY=secret_xxxx
NOTION_DATABASE_ID=xxxx
```

### Step 2. Notion API 클라이언트 구현

- `src/lib/notion.ts`: Notion 클라이언트 초기화 및 데이터 페칭 함수 작성
  - `getCourses()`: 강의 목록 조회
  - `getNotes(databaseId)`: 특정 강의의 노트 목록 조회
  - `getNote(noteId)`: 노트 상세 및 블록 콘텐츠 조회

### Step 3. 홈 페이지 구현

- `src/app/page.tsx`: 강의 목록 카드
- `src/components/common/course-card.tsx`: 강의 카드 컴포넌트

### Step 4. 노트 목록 페이지 구현

- `src/app/courses/[courseId]/page.tsx`: 강의별 노트 목록
- `src/components/common/note-card.tsx`: 노트 목록 아이템 컴포넌트

### Step 5. 노트 상세 페이지 구현

- `src/app/courses/[courseId]/[noteId]/page.tsx`: 노트 상세
- `src/components/common/notion-renderer.tsx`: Notion 블록 → React 컴포넌트 렌더러

### Step 6. 스타일링 및 최적화

- 반응형 레이아웃 적용
- ISR 설정 (`revalidate = 60`)
- SEO 메타 태그 설정 (`generateMetadata`)

---

## 9. 디렉토리 구조 (예상)

```
src/
├── app/
│   ├── page.tsx                                    # 홈 (강의 목록)
│   └── courses/
│       └── [courseId]/
│           ├── page.tsx                            # 노트 목록
│           └── [noteId]/
│               └── page.tsx                        # 노트 상세
├── components/
│   ├── common/
│   │   ├── course-card.tsx                         # 강의 카드
│   │   ├── note-card.tsx                           # 노트 목록 아이템
│   │   └── notion-renderer.tsx                     # Notion 블록 렌더러
│   └── ui/                                         # shadcn/ui 컴포넌트
└── lib/
    ├── notion.ts                                   # Notion API 클라이언트
    └── utils.ts                                    # 유틸리티 함수
```

---

## 10. 환경 변수

| 변수명 | 설명 | 필수 여부 |
|--------|------|-----------|
| `NOTION_API_KEY` | Notion Integration API 키 | 필수 |
| `NOTION_DATABASE_ID` | 강의 목록 데이터베이스 ID | 필수 |
| `ADMIN_PASSWORD` | 관리자 로그인 비밀번호 | 관리자 기능(v3) 사용 시 필수 |
| `ADMIN_SESSION_SECRET` | 관리자 세션 토큰 서명용 시크릿 (비밀번호와 별도 키) | 관리자 기능(v3) 사용 시 필수 |
