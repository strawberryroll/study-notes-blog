# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요

Next.js 16 (App Router) + TypeScript + Tailwind CSS 4 + shadcn/ui(Radix, "radix-nova" 스타일) 기반의 강의 복습 노트 블로그. Notion을 CMS로 사용하여(`@notionhq/client`) 강의별로 정리한 복습 노트를 강의 목록 → 노트 목록 → 노트 상세 구조로 공개한다. 다크 모드, ISR(`revalidate = 60`) 기반 콘텐츠 갱신, 공용 레이아웃(Header/Footer)을 제공한다.

## 자주 쓰는 명령어

```bash
pnpm dev      # 개발 서버 (Turbopack)
pnpm build    # 프로덕션 빌드 (타입 체크 포함)
pnpm start    # 프로덕션 서버 실행
pnpm lint     # ESLint 검사
```

- 패키지 매니저는 **pnpm**을 사용한다 (pnpm-lock.yaml 존재).
- 테스트 러너는 아직 설정되어 있지 않다.

### shadcn/ui 컴포넌트 추가

```bash
pnpm dlx shadcn@latest add <컴포넌트명> -y
```

- `-y` 플래그로 대화형 프롬프트를 건너뛴다 (그렇지 않으면 라이브러리/프리셋 선택 프롬프트가 떠서 비대화형 실행이 막힌다).
- `components.json` 설정: style `radix-nova`, baseColor `neutral`, iconLibrary `lucide`, cssVariables 사용.
- 설치된 컴포넌트는 `src/components/ui/`에 생성되며, 이 디렉토리는 CLI가 관리하는 영역이므로 직접 수정은 최소화한다 (이후 `add --overwrite` 시 충돌 방지).

## 의존성 관련 주의사항

- **`zod`는 `4.0.17`로 정확히 고정**되어 있다 (`^` 범위 아님). `@hookform/resolvers@5.4.0`은 zod core의 `_zod.version.minor`가 `0`인 버전을 기준으로 타입이 빌드되어 있어, zod 4.1.x 이상으로 올리면 `pnpm build` 시 `zodResolver` 타입 에러(`No overload matches this call`)가 발생한다. zod를 업그레이드하려면 `@hookform/resolvers`도 호환되는 버전으로 함께 올려야 한다.
- React Compiler(`next.config.ts`의 `reactCompiler: true`)가 활성화되어 있다. `react-hook-form`의 `watch()`는 컴파일러가 메모이즈할 수 없다는 경고(`react-hooks/incompatible-library`)를 발생시키므로, 폼 값 구독에는 `watch()` 대신 `useWatch({ control, name })`를 사용한다 (`src/components/common/contact-form.tsx` 참고).

## 아키텍처 / 디렉토리 구조

```
src/
├── app/
│   ├── layout.tsx     # RootLayout: ThemeProvider, TooltipProvider, Header, Footer, Toaster 합성
│   ├── page.tsx        # 홈페이지 (Hero, Feature 카드, 컴포넌트 데모 탭, FAQ)
│   └── globals.css     # Tailwind 4 + shadcn 테마 변수(OKLCH), 다크모드(.dark 클래스) 정의
├── components/
│   ├── ui/              # shadcn CLI가 생성하는 원자적(atomic) 컴포넌트. 직접 수정 최소화
│   ├── layout/           # 페이지 골조 컴포넌트 (페이지당 보통 1회 사용)
│   │   ├── container.tsx # max-width + 반응형 padding 래퍼
│   │   ├── header.tsx    # sticky 헤더 (Logo + ThemeToggle)
│   │   └── footer.tsx
│   └── common/           # 여러 곳에서 재사용되는 합성 컴포넌트
│       ├── theme-provider.tsx  # next-themes ThemeProvider 래핑
│       ├── theme-toggle.tsx    # DropdownMenu + lucide Sun/Moon
│       ├── logo.tsx
│       └── contact-form.tsx    # react-hook-form + zod 폼 검증 데모
├── hooks/                # 커스텀 훅 (현재 비어있음, 필요 시 use-xxx.ts 추가)
└── lib/
    └── utils.ts          # cn() — clsx + tailwind-merge
```

### 컴포넌트 계층 규칙

- **`ui`**: shadcn/ui 원본. kebab-case 파일명, PascalCase named export.
- **`layout`**: 페이지 골조(Header/Footer/Container). `Container`로 페이지 폭과 패딩을 통일한다.
- **`common`**: `ui` 컴포넌트 2개 이상을 조합하거나 외부 라이브러리(next-themes 등)를 래핑하는 재사용 컴포넌트.
- 경로 별칭은 `@/*` → `./src/*` (예: `@/components/ui/button`, `@/lib/utils`).

### 폼 작성 패턴

이 shadcn 버전에는 `Form`/`useFormField` 컨텍스트가 없다. 대신 `src/components/ui/field.tsx`의 프리미티브(`Field`, `FieldLabel`, `FieldError`, `FieldGroup` 등)를 `react-hook-form`의 `register()`/`errors`와 직접 연결한다:

```tsx
<Field data-invalid={!!errors.name}>
  <FieldLabel htmlFor="name">이름</FieldLabel>
  <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
  <FieldError errors={[errors.name]} />
</Field>
```

검증 스키마는 `zod`로 정의하고 `@hookform/resolvers/zod`의 `zodResolver`로 연결한다. 예시: `src/components/common/contact-form.tsx`.

### 테마 / 스타일링

- Tailwind CSS 4, `@theme inline` 블록(`globals.css`)에서 shadcn 색상/반경 변수(`--color-*`, `--radius-*`)를 정의.
- 다크모드는 `@custom-variant dark (&:is(.dark *))` + `.dark` 클래스 기반. `next-themes`(`attribute="class"`)가 `<html>`에 `.dark`를 토글한다.
- `<html>`에 `suppressHydrationWarning`이 설정되어 있다 (next-themes 필수 요구사항).
- 폰트: Geist Sans/Mono (`next/font/google`), `--font-sans`는 `--font-geist-sans`를 가리킨다.
- 새 컴포넌트의 클래스 병합에는 `cn()` (`@/lib/utils`)을 사용한다.

### 토스트 / 오버레이

- 토스트는 `sonner`의 `toast()` 사용, `<Toaster />`는 `layout.tsx`에 전역 등록되어 있음.
- `Tooltip` 사용 시 `TooltipProvider`로 감싸야 하며, 이는 이미 `layout.tsx`의 RootLayout에 전역 적용되어 있다.

## project context

- PRD 문서: @docs/PRD.md
- 개발 로드맵: @docs/ROADMAP.md
