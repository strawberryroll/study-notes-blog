import Link from "next/link"

import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { NoteMeta } from "@/components/common/note-meta"
import type { Note } from "@/lib/notion"

function NoteCard({ courseId, note }: { courseId: string; note: Note }) {
  return (
    <Link href={`/courses/${courseId}/${note.id}`} className="block">
      <Card className="transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5 hover:ring-foreground/20">
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <div className="mt-2">
            <NoteMeta note={note} />
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}

export { NoteCard }
