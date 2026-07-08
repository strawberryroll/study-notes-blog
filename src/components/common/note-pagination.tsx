import Link from "next/link"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { Note } from "@/lib/notion"

function NotePagination({
  courseId,
  prev,
  next,
}: {
  courseId: string
  prev: Note | null
  next: Note | null
}) {
  if (!prev && !next) return null

  return (
    <nav aria-label="이전/다음 노트" className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {prev ? (
        <Link href={`/courses/${courseId}/${prev.id}`} className="block">
          <Card className="h-full transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5 hover:ring-foreground/20">
            <CardHeader>
              <p className="text-sm text-muted-foreground">이전 노트</p>
              <CardTitle>{prev.title}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ) : (
        <div />
      )}

      {next ? (
        <Link href={`/courses/${courseId}/${next.id}`} className="block sm:text-right">
          <Card
            className={cn(
              "h-full transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5 hover:ring-foreground/20"
            )}
          >
            <CardHeader>
              <p className="text-sm text-muted-foreground">다음 노트</p>
              <CardTitle>{next.title}</CardTitle>
            </CardHeader>
          </Card>
        </Link>
      ) : (
        <div />
      )}
    </nav>
  )
}

export { NotePagination }
