import { Skeleton } from "@/components/ui/skeleton"
import { Container } from "@/components/layout/container"

export default function Loading() {
  return (
    <Container className="py-16 sm:py-24">
      {/* 강의명 헤더 영역 */}
      <div className="mb-8 space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* 노트 목록 5개 행 */}
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-lg border p-4">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    </Container>
  )
}
