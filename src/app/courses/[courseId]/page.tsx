import { notFound } from "next/navigation"

import { getCourses, getNotes } from "@/lib/notion"
import { NoteCard } from "@/components/common/note-card"
import { Container } from "@/components/layout/container"

export const revalidate = 60

export default async function CourseNotesPage({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params

  const courses = await getCourses()
  const course = courses.find((c) => c.id === courseId)
  if (!course) notFound()

  const notes = await getNotes(course.databaseId)

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">{course.title}</h1>
        {course.description && (
          <p className="mt-2 text-muted-foreground">{course.description}</p>
        )}
      </div>

      {notes.length === 0 ? (
        <p className="text-muted-foreground">발행된 노트가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} courseId={courseId} />
          ))}
        </div>
      )}
    </Container>
  )
}
