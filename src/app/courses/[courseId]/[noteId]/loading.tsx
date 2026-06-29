import { Skeleton } from "@/components/ui/skeleton"
import { Container } from "@/components/layout/container"

export default function Loading() {
  return (
    <Container className="py-16 sm:py-24">
      {/* 노트 제목 */}
      <Skeleton className="mb-4 h-9 w-3/4" />

      {/* 태그 / 날짜 메타 정보 */}
      <div className="mb-6 flex gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-32" />
      </div>

      {/* 구분선 */}
      <div className="mb-8 border-t" />

      {/* 본문 블록 */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </Container>
  )
}
