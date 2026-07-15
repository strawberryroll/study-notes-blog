import { Badge } from "@/components/ui/badge"
import type { Note } from "@/lib/notion"

function NoteMeta({ note }: { note: Pick<Note, "published" | "tags"> }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {note.published && (
        <span className="text-sm text-muted-foreground">{note.published}</span>
      )}
      {note.tags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
    </div>
  )
}

export { NoteMeta }
