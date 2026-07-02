import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Container } from "@/components/layout/container"

export default function NotFound() {
  return (
    <Container className="py-16 text-center sm:py-24">
      <h1 className="text-3xl font-semibold tracking-tight">
        페이지를 찾을 수 없습니다
      </h1>
      <p className="mt-3 text-muted-foreground">
        요청하신 강의 또는 노트가 존재하지 않거나 삭제되었습니다.
      </p>
      <Button asChild className="mt-8">
        <Link href="/">홈으로 돌아가기</Link>
      </Button>
    </Container>
  )
}
