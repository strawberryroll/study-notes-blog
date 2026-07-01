import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import type { Note } from "@/lib/notion"

function NoteCard({ courseId, note }: { courseId: string; note: Note }) {
  return (
    <Link href={`/courses/${courseId}/${note.id}`} className="block">
      <Card className="transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5 hover:ring-foreground/20">
        <CardHeader>
          <CardTitle>{note.title}</CardTitle>
          <div className="mt-2 flex flex-wrap items-center gap-2">
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
        </CardHeader>
      </Card>
    </Link>
  )
}

export { NoteCard }
