"use client"

import Link from "next/link"
import { useState } from "react"

import { revalidateNoteAction } from "@/app/admin/actions"
import { RevalidateButton } from "@/components/admin/revalidate-button"
import { StatusBadge } from "@/components/admin/status-badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { CourseWithNotes } from "@/lib/notion"

const FILTERS = ["전체", "대기", "초안", "발행됨"] as const
type Filter = (typeof FILTERS)[number]

export function NotesTable({ data }: { data: CourseWithNotes[] }) {
  const [filter, setFilter] = useState<Filter>("전체")

  return (
    <div className="flex flex-col gap-8">
      <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
        <TabsList>
          {FILTERS.map((f) => (
            <TabsTrigger key={f} value={f}>
              {f}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {data.map(({ course, notes }) => {
        const filtered =
          filter === "전체" ? notes : notes.filter((note) => note.status === filter)

        return (
          <section key={course.id}>
            <h2 className="text-lg font-semibold">{course.title}</h2>
            {filtered.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">노트가 없습니다.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>제목</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead>작성일</TableHead>
                    <TableHead>작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>{note.title}</TableCell>
                      <TableCell>
                        <StatusBadge status={note.status} />
                      </TableCell>
                      <TableCell>{note.published}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/admin/courses/${course.id}/${note.id}`}>
                              미리보기
                            </Link>
                          </Button>
                          <RevalidateButton
                            action={revalidateNoteAction.bind(null, course.id, note.id)}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </section>
        )
      })}
    </div>
  )
}
