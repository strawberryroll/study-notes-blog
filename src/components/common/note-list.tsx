"use client"

import { useState } from "react"

import { NoteCard } from "@/components/common/note-card"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import type { Note } from "@/lib/notion"

function NoteList({ courseId, notes }: { courseId: string; notes: Note[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)))

  const filtered = notes.filter(
    (n) =>
      (!selectedTag || n.tags.includes(selectedTag)) &&
      n.title.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Input
          aria-label="노트 검색"
          placeholder="노트 제목 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        {allTags.length > 0 && (
          <div role="group" aria-label="태그 필터" className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                aria-pressed={selectedTag === tag}
                onClick={() =>
                  setSelectedTag((prev) => (prev === tag ? null : tag))
                }
                className={cn(
                  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">일치하는 노트가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((note) => (
            <NoteCard key={note.id} courseId={courseId} note={note} />
          ))}
        </div>
      )}
    </div>
  )
}

export { NoteList }
