import { notFound } from "next/navigation"

import { getNote } from "@/lib/notion"
import { NotionRenderer } from "@/components/common/notion-renderer"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"

export const revalidate = 60

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ courseId: string; noteId: string }>
}) {
  const { noteId } = await params

  let data: Awaited<ReturnType<typeof getNote>>
  try {
    data = await getNote(noteId)
  } catch {
    notFound()
  }

  const { page, blocks } = data

  return (
    <Container className="py-12">
      <article className="mx-auto max-w-3xl">
        <header className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">{page.title}</h1>
          {page.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {page.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          {page.published && (
            <p className="mt-3 text-sm text-muted-foreground">{page.published}</p>
          )}
        </header>

        <NotionRenderer blocks={blocks} />
      </article>
    </Container>
  )
}
