# Development Guidelines

## Project Overview

- **목적**: Notion CMS 기반 강의 복습 노트 블로그
- **스택**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui (radix-nova)
- **배포**: Vercel
- **패키지 매니저**: pnpm (절대 npm/yarn 사용 금지)

---

## Project Architecture

### 디렉토리 구조

```
src/
├── app/
│   ├── layout.tsx              # RootLayout: ThemeProvider, TooltipProvider, Header, Footer, Toaster
│   ├── page.tsx                # 홈 (강의 목록 카드)
│   ├── globals.css             # Tailwind 4 + shadcn 테마 변수
│   └── courses/
│       └── [courseId]/
│           ├── page.tsx        # 노트 목록
│           └── [noteId]/
│               └── page.tsx   # 노트 상세
├── components/
│   ├── ui/                    # shadcn CLI 관리 영역 — 직접 수정 금지
│   ├── layout/                # 페이지 골조 (Header, Footer, Container, MainNav)
│   └── common/                # ui 컴포넌트 2개 이상 조합 또는 외부 라이브러리 래핑
├── lib/
│   ├── utils.ts               # cn() 유틸리티
│   └── notion.ts              # Notion API 클라이언트 및 데이터 페칭 함수 (구현 예정)
└── hooks/                     # 커스텀 훅 (use-xxx.ts 형식)
```

### 컴포넌트 계층 규칙

- **`ui/`**: shadcn 원본. 직접 수정 금지. `pnpm dlx shadcn@latest add <name> -y`로만 추가
- **`layout/`**: 페이지 골조 컴포넌트. `Container`로 페이지 폭/패딩 통일
- **`common/`**: `ui` 컴포넌트 2개 이상 조합 또는 외부 라이브러리 래핑

### 경로 별칭

- `@/*` → `./src/*` (예: `@/components/ui/button`, `@/lib/utils`)

---

## Code Standards

### 명명 규칙

- 파일명: kebab-case (예: `course-card.tsx`, `notion-renderer.tsx`)
- 컴포넌트 export: PascalCase named export (예: `export function CourseCard()`)
- 훅 파일: `use-xxx.ts` 형식

### 클래스 병합

- 반드시 `cn()` (`@/lib/utils`) 사용
- 직접 문자열 연결 금지

---

## Functionality Implementation Standards

### Notion API 연동

- Notion API 함수는 반드시 `src/lib/notion.ts`에 작성
- 필수 구현 함수:
  - `getCourses()`: 강의 목록 DB 전체 조회
  - `getNotes(databaseId: string)`: `Status === "발행됨"` 필터 + `Published` 내림차순
  - `getNote(noteId: string)`: 노트 상세 + 블록 콘텐츠 조회
- 환경 변수: `NOTION_API_KEY`, `NOTION_DATABASE_ID` (`.env.local` 및 Vercel 설정 필요)

### 페이지 데이터 페칭

- Server Component에서 직접 Notion API 함수 호출 (별도 API Route 불필요)
- ISR 설정: 각 페이지에 `export const revalidate = 60` 추가

### SEO

- 각 페이지에 `generateMetadata` 함수 구현 (`title`, `description`, Open Graph)
- 이미지에 반드시 `alt` 텍스트 포함

### Notion 블록 렌더러

- `src/components/common/notion-renderer.tsx`에 구현
- MVP 지원 블록: 단락, 헤딩(H1–H3), 불릿 목록, 번호 목록, 코드 블록, 인용, 구분선, 이미지
- 미지원 블록은 에러 없이 `null` 반환(스킵)

---

## Framework / Library Usage Standards

### shadcn/ui 컴포넌트 추가

```bash
pnpm dlx shadcn@latest add <컴포넌트명> -y
```

- **반드시 `-y` 플래그 사용** (없으면 대화형 프롬프트로 비대화형 실행 불가)
- 설치된 컴포넌트는 `src/components/ui/`에 생성됨

### 폼 작성 패턴

**이 shadcn 버전에는 `Form`/`useFormField` 컨텍스트가 없다.** `src/components/ui/field.tsx`의 프리미티브를 사용한다.

```tsx
// ✅ 올바른 패턴
import { Field, FieldLabel, FieldError, FieldGroup } from "@/components/ui/field"

<Field data-invalid={!!errors.name}>
  <FieldLabel htmlFor="name">이름</FieldLabel>
  <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
  <FieldError errors={[errors.name]} />
</Field>
```

```tsx
// ❌ 금지: Form, FormField, FormItem, useFormField 사용
import { Form, FormField, FormItem } from "@/components/ui/form"
```

- 검증 스키마: `zod`로 정의 + `@hookform/resolvers/zod`의 `zodResolver`로 연결

### React Hook Form + React Compiler

- **`watch()` 사용 금지** — React Compiler가 메모이즈 불가 (`react-hooks/incompatible-library` 경고 발생)
- 폼 값 구독 시 반드시 `useWatch({ control, name })` 사용

```tsx
// ✅ 올바른 패턴
const value = useWatch({ control, name: "fieldName" })

// ❌ 금지
const value = watch("fieldName")
```

### 의존성 버전 제약

- **`zod`는 `4.0.17`로 고정** — `^` 범위 아님, 단독 업그레이드 금지
  - 이유: `@hookform/resolvers@5.4.0`이 zod 4.0.x 기준 타입 빌드, 4.1.x 이상 시 `zodResolver` 타입 에러 발생
  - 업그레이드 시 `@hookform/resolvers`도 호환 버전으로 함께 올릴 것

### 토스트 알림

- `sonner`의 `toast()` 사용
- `<Toaster />`는 `layout.tsx`에 전역 등록되어 있음 — 페이지/컴포넌트에 중복 추가 금지

### Tooltip

- `TooltipProvider`는 `layout.tsx`의 RootLayout에 전역 적용됨
- 개별 컴포넌트에 `TooltipProvider` 중복 추가 금지

---

## Theming & Styling

- Tailwind CSS 4, `globals.css`의 `@theme inline` 블록에서 shadcn 색상/반경 변수 정의
- 다크모드: `@custom-variant dark (&:is(.dark *))` + `.dark` 클래스 기반
  - `next-themes`(`attribute="class"`)가 `<html>`에 `.dark` 토글
- `<html>`에 `suppressHydrationWarning` 필수 (next-themes 요구사항, 이미 설정됨)
- 폰트: Geist Sans/Mono (`next/font/google`), CSS 변수 `--font-sans` 사용

---

## Key File Interaction Standards

| 파일 | 수정 시 함께 확인할 파일 |
|------|--------------------------|
| `src/app/layout.tsx` | 전역 Provider 추가/제거 시 모든 페이지에 영향 |
| `src/lib/notion.ts` | 타입 정의 변경 시 해당 타입을 사용하는 모든 페이지/컴포넌트 |
| `src/app/globals.css` | 테마 변수 변경 시 다크/라이트 모드 양쪽 확인 |
| `.env.local` | 새 환경 변수 추가 시 Vercel 대시보드에도 동일하게 설정 |
| `package.json` (zod) | zod 버전 변경 시 `@hookform/resolvers` 호환 버전 동시 확인 필수 |

---

## Workflow Standards

### 개발 명령어

```bash
pnpm dev      # 개발 서버 (Turbopack)
pnpm build    # 프로덕션 빌드 (타입 체크 포함)
pnpm lint     # ESLint 검사
```

### Phase 진행 원칙 (ROADMAP.md 기준)

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5
```

- 각 Phase: 구현 완료 → Playwright MCP 테스트 통과 → 다음 Phase 진행
- 테스트 도구: `mcp__playwright__*` 도구 사용
- 테스트 항목: `browser_navigate`, `browser_snapshot`, `browser_console_messages`, `browser_resize` 등

---

## AI Decision-making Standards

### 컴포넌트 생성 위치 결정

```
새 컴포넌트 필요
├── shadcn에서 제공하는가? → pnpm dlx shadcn@latest add <name> -y → src/components/ui/
├── 단일 ui 컴포넌트 + 로직만? → src/components/common/
├── 페이지 골조(Header/Footer/Nav)? → src/components/layout/
└── 재사용 불필요한 페이지 전용? → 해당 page.tsx 파일 내 인라인
```

### 데이터 페칭 방식 결정

```
데이터 페칭 필요
├── Notion 데이터? → src/lib/notion.ts의 함수 호출 (Server Component)
├── 클라이언트 사이드 상태? → useState + useEffect (Client Component)
└── API Route 생성? → 외부 웹훅/서드파티 연동 목적이 아닌 한 생성 금지
```

---

## Prohibited Actions

- `src/components/ui/` 파일 직접 수정 (shadcn CLI 관리 영역)
- `Form`, `FormField`, `FormItem`, `useFormField` 사용 (이 shadcn 버전에 없음)
- `watch()` 사용 (React Compiler 비호환 → `useWatch()` 사용)
- `zod` 단독 버전 업그레이드 (반드시 `@hookform/resolvers`와 함께)
- `npm install` 또는 `yarn add` 사용 (반드시 `pnpm add`)
- `<Toaster />` 또는 `<TooltipProvider>` 페이지/컴포넌트에 중복 추가
- 미지원 Notion 블록 타입에 대한 에러 throw (반드시 `null` 반환으로 스킵)
- Server Component에서 `"use client"` 없이 이벤트 핸들러 또는 훅 사용
- `pnpm build` 타입 에러 상태로 Phase 완료 처리
