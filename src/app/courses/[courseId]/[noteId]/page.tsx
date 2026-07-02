import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"
import { NotionRenderer } from "@/components/common/notion-renderer"
import { getNote, type BlockObjectResponse, type Note } from "@/lib/notion"

interface Props {
  params: Promise<{ courseId: string; noteId: string }>
}

export const revalidate = 60

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { noteId } = await params

  try {
    const { page: note } = await getNote(noteId)
    const description =
      [note.published, ...note.tags].filter(Boolean).join(" · ") ||
      "강의 복습 노트"

    return {
      title: `${note.title} | Study Notes`,
      description,
      openGraph: {
        title: note.title,
        description,
        type: "article",
      },
    }
  } catch {
    return { title: "노트를 찾을 수 없습니다 | Study Notes" }
  }
}

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
