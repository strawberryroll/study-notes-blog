import Link from "next/link"
import { notFound } from "next/navigation"
import { Eye } from "lucide-react"

import { StatusBadge } from "@/components/admin/status-badge"
import { NotionRenderer } from "@/components/common/notion-renderer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { getCourses, getNote, type BlockWithChildren, type Note } from "@/lib/notion"

interface Props {
  params: Promise<{ courseId: string; noteId: string }>
}

export const dynamic = "force-dynamic"

export default async function AdminNotePreviewPage({ params }: Props) {
  const { courseId, noteId } = await params

  const courses = await getCourses()
  const course = courses.find((c) => c.id === courseId)
  if (!course) notFound()

  let note: Note
  let blocks: BlockWithChildren[]
  try {
    ;({ page: note, blocks } = await getNote(noteId))
  } catch {
    notFound()
  }

  return (
    <div className="flex flex-col gap-6">
      <Alert>
        <AlertTitle>관리자 미리보기</AlertTitle>
        <AlertDescription>
          이 페이지는 발행 여부와 무관하게 노트 내용을 확인하는 관리자 전용 화면입니다.
        </AlertDescription>
      </Alert>

      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{note.title}</h1>
          <StatusBadge status={note.status} />
        </div>
        {note.status === "발행됨" && (
          <Button asChild variant="outline" size="sm">
            <Link href={`/courses/${courseId}/${noteId}`} target="_blank">
              <Eye className="size-4" />
              공개 페이지 보기
            </Link>
          </Button>
        )}
      </div>

      <NotionRenderer blocks={blocks} />
    </div>
  )
}
