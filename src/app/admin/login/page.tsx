import { Container } from "@/components/layout/container"
import { LoginForm } from "@/components/admin/login-form"

interface Props {
  searchParams: Promise<{ redirect?: string }>
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { redirect } = await searchParams
  const redirectTo = redirect?.startsWith("/admin") ? redirect : "/admin"

  return (
    <Container className="flex max-w-sm flex-col gap-6 py-16 sm:py-24">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight">관리자 로그인</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          비밀번호를 입력해 관리자 대시보드에 접속하세요.
        </p>
      </div>
      <LoginForm redirectTo={redirectTo} />
    </Container>
  )
}
