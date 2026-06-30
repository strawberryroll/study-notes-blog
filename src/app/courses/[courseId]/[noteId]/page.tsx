import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"
import { NotionRenderer } from "@/components/common/notion-renderer"
import { getNote, type BlockObjectResponse, type Note } from "@/lib/notion"

interface Props {
  params: Promise<{ courseId: string; noteId: string }>
}

export const revalidate = 60

export default async function NoteDetailPage({ params }: Props) {
  const { noteId } = await params

  let note: Note
  let blocks: BlockObjectResponse[]

  try {
    ;({ page: note, blocks } = await getNote(noteId))
  } catch {
    notFound()
  }

  return (
    <Container className="py-16 sm:py-24">
      <div className="mb-8 space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight">
          {note.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {note.published && (
            <span className="text-sm text-muted-foreground">
              {note.published}
            </span>
          )}
          {note.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mb-8 border-t" />

      <NotionRenderer blocks={blocks} />
    </Container>
  )
}
