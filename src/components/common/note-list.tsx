"use client"

import { useState } from "react"

import { NoteCard } from "@/components/common/note-card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Note } from "@/lib/notion"

type SortOrder = "desc" | "asc"

function NoteList({ courseId, notes }: { courseId: string; notes: Note[] }) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const allTags = Array.from(new Set(notes.flatMap((n) => n.tags)))

  const filtered = notes
    .filter(
      (n) =>
        (!selectedTag || n.tags.includes(selectedTag)) &&
        n.title.toLowerCase().includes(query.toLowerCase())
    )
    .sort((a, b) => {
      const diff = new Date(a.published).getTime() - new Date(b.published).getTime()
      return sortOrder === "asc" ? diff : -diff
    })

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            aria-label="노트 검색"
            placeholder="노트 제목 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1"
          />
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as SortOrder)}
          >
            <SelectTrigger aria-label="정렬 기준" className="sm:w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">최신순</SelectItem>
              <SelectItem value="asc">오래된순</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
