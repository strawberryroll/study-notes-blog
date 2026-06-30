import { notFound } from "next/navigation"

import { NoteCard } from "@/components/common/note-card"
import { Container } from "@/components/layout/container"
import { getCourses, getNotes } from "@/lib/notion"

interface Props {
  params: Promise<{ courseId: string }>
}

export const revalidate = 60

export default async function CourseNotesPage({ params }: Props) {
  const { courseId } = await params

  const courses = await getCourses()
  const course = courses.find((c) => c.id === courseId)

  if (!course) {
    notFound()
  }

  const notes = await getNotes(course.databaseId)

  return (
    <Container className="py-16 sm:py-24">
      <div className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {course.title}
        </h1>
        {course.description && (
          <p className="text-muted-foreground">{course.description}</p>
        )}
      </div>

      {notes.length === 0 ? (
        <p className="text-muted-foreground">등록된 노트가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <NoteCard key={note.id} courseId={course.id} note={note} />
          ))}
        </div>
      )}
    </Container>
  )
}
