# 강의 복습 노트 블로그

강의를 수강하며 Notion에 정리한 복습 노트를 블로그 형태로 공개하는 사이트. Notion에서 노트를 작성하거나 수정하면 별도 배포 없이 블로그에 자동으로 반영된다.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 16 (App Router), TypeScript |
| CMS | Notion API (`@notionhq/client`) |
| Styling | Tailwind CSS 4, shadcn/ui |
| Icons | Lucide React |
| Deployment | Vercel |

## 시작하기

### 1. 환경 변수 설정

`.env.local` 파일을 생성하고 아래 값을 입력한다.

```env
NOTION_API_KEY=secret_xxxx
NOTION_DATABASE_ID=xxxx
```

- `NOTION_API_KEY`: [Notion Integrations](https://www.notion.so/my-integrations)에서 발급
- `NOTION_DATABASE_ID`: 강의 목록을 관리하는 Notion 데이터베이스 URL에서 추출

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 개발 서버 실행

```bash
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인한다.

## 주요 명령어

```bash
pnpm dev              # 개발 서버 실행 (Turbopack)
pnpm build            # 프로덕션 빌드 (타입 체크 포함)
pnpm start            # 프로덕션 서버 실행
pnpm lint             # ESLint 검사
pnpm exec tsc --noEmit # TypeScript 타입 체크만 별도 실행
```

## 프로젝트 구조

```
src/
├── app/
│   ├── layout.tsx                     # RootLayout
│   ├── page.tsx                       # 홈 (강의 목록)
│   ├── not-found.tsx                  # 404 페이지
│   └── courses/
│       └── [courseId]/
│           ├── page.tsx               # 강의별 노트 목록 (태그 필터/검색)
│           └── [noteId]/page.tsx      # 노트 상세 (목차, 이전/다음 네비게이션)
├── components/
│   ├── ui/                            # shadcn/ui 원자 컴포넌트
│   ├── layout/                        # Header, Footer, Container
│   └── common/                        # CourseCard, NoteCard, NotionRenderer,
│                                       # BookmarkCard, CodeBlock, TableOfContents,
│                                       # NotePagination, NotionImage 등
└── lib/
    ├── notion.ts                      # Notion API 클라이언트
    ├── link-preview.ts                # bookmark 블록 OG 메타데이터 파싱
    ├── shiki-highlighter.ts           # 코드 블록 문법 하이라이팅
    └── utils.ts                       # cn() 유틸리티
```

## 문서

- [PRD (제품 요구사항 명세서)](./docs/PRD.md)
- [ROADMAP (개발 로드맵)](./docs/ROADMAP.md)
