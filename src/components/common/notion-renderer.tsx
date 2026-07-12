import { Suspense } from "react"
import { ChevronRight, Square, SquareCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { BookmarkCard, MinimalBookmarkCard } from "@/components/common/bookmark-card"
import { HighlightedCodeBlock, PlainCodeBlock } from "@/components/common/code-block"
import { NotionImage } from "@/components/common/notion-image"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { BlockWithChildren } from "@/lib/notion"

function extractPlainText(richText: { plain_text: string }[]): string {
  return richText.map((t) => t.plain_text).join("")
}

function NotionBlock({ block }: { block: BlockWithChildren }) {
  switch (block.type) {
    case "paragraph": {
      const text = extractPlainText(block.paragraph.rich_text)
      if (!text) return <p className="h-4" aria-hidden="true" />
      return <p className="leading-7">{text}</p>
    }

    case "heading_1": {
      const text = extractPlainText(block.heading_1.rich_text)
      return (
        <h1
          id={block.id}
          className="mt-8 scroll-mt-24 text-2xl font-semibold tracking-tight first:mt-0"
        >
          {text}
        </h1>
      )
    }

    case "heading_2": {
      const text = extractPlainText(block.heading_2.rich_text)
      return (
        <h2
          id={block.id}
          className="mt-6 scroll-mt-24 text-xl font-semibold tracking-tight first:mt-0"
        >
          {text}
        </h2>
      )
    }

    case "heading_3": {
      const text = extractPlainText(block.heading_3.rich_text)
      return (
        <h3
          id={block.id}
          className="mt-4 scroll-mt-24 text-lg font-semibold tracking-tight first:mt-0"
        >
          {text}
        </h3>
      )
    }

    case "bulleted_list_item": {
      const text = extractPlainText(block.bulleted_list_item.rich_text)
      return <li className="leading-7">{text}</li>
    }

    case "numbered_list_item": {
      const text = extractPlainText(block.numbered_list_item.rich_text)
      return <li className="leading-7">{text}</li>
    }

    case "code": {
      const text = extractPlainText(block.code.rich_text)
      const language = block.code.language
      return (
        <Suspense fallback={<PlainCodeBlock code={text} />}>
          <HighlightedCodeBlock code={text} language={language} />
        </Suspense>
      )
    }

    case "quote": {
      const text = extractPlainText(block.quote.rich_text)
      return (
        <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic text-muted-foreground">
          {text}
        </blockquote>
      )
    }

    case "divider":
      return <hr className="border-t" />

    case "toggle": {
      const text = extractPlainText(block.toggle.rich_text)
      return (
        <details className="group rounded-lg border p-3">
          <summary className="flex cursor-pointer items-center gap-2 font-medium marker:content-none">
            <ChevronRight className="size-4 shrink-0 transition-transform group-open:rotate-90" />
            {text}
          </summary>
          <div className="mt-2 pl-6">
            <NotionRenderer blocks={block.children} />
          </div>
        </details>
      )
    }

    case "callout": {
      const text = extractPlainText(block.callout.rich_text)
      const icon = block.callout.icon
      return (
        <div className="flex gap-3 rounded-lg bg-muted p-4">
          <span aria-hidden="true">{icon?.type === "emoji" ? icon.emoji : "💡"}</span>
          <div className="space-y-2">
            <p className="leading-7">{text}</p>
            {block.has_children && <NotionRenderer blocks={block.children} />}
          </div>
        </div>
      )
    }

    case "to_do": {
      const text = extractPlainText(block.to_do.rich_text)
      return (
        <li className="flex list-none items-start gap-2 leading-7">
          {block.to_do.checked ? (
            <SquareCheck className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          ) : (
            <Square className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          )}
          <span className={cn(block.to_do.checked && "text-muted-foreground line-through")}>
            {text}
          </span>
        </li>
      )
    }

    case "table": {
      const rows = block.children.filter(
        (c): c is BlockWithChildren & { type: "table_row" } => c.type === "table_row"
      )
      const [headerRow, ...bodyRows] = rows
      const dataRows = block.table.has_column_header ? bodyRows : rows

      return (
        <Table>
          {block.table.has_column_header && headerRow && (
            <TableHeader>
              <TableRow>
                {headerRow.table_row.cells.map((cell, i) => (
                  <TableHead key={i}>{extractPlainText(cell)}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
          )}
          <TableBody>
            {dataRows.map((row) => (
              <TableRow key={row.id}>
                {row.table_row.cells.map((cell, i) => (
                  <TableCell key={i}>{extractPlainText(cell)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )
    }

    case "bookmark": {
      const { url, caption } = block.bookmark
      return (
        <Suspense fallback={<MinimalBookmarkCard url={url} caption={caption} />}>
          <BookmarkCard url={url} caption={caption} />
        </Suspense>
      )
    }

    case "image": {
      const image = block.image
      const src = image.type === "external" ? image.external.url : image.file.url
      const alt = extractPlainText(image.caption) || "노트 이미지"
      return (
        <figure className="space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <NotionImage src={src} alt={alt} />
          </div>
          {image.caption.length > 0 && (
            <figcaption className="text-center text-sm text-muted-foreground">
              {extractPlainText(image.caption)}
            </figcaption>
          )}
        </figure>
      )
    }

    default:
      return null
  }
}

export type Heading = { id: string; text: string; level: 1 | 2 | 3 }

function extractHeadings(blocks: BlockWithChildren[]): Heading[] {
  const headings: Heading[] = []

  for (const block of blocks) {
    if (block.type === "heading_1") {
      headings.push({ id: block.id, text: extractPlainText(block.heading_1.rich_text), level: 1 })
    } else if (block.type === "heading_2") {
      headings.push({ id: block.id, text: extractPlainText(block.heading_2.rich_text), level: 2 })
    } else if (block.type === "heading_3") {
      headings.push({ id: block.id, text: extractPlainText(block.heading_3.rich_text), level: 3 })
    }

    if (block.children.length > 0) {
      headings.push(...extractHeadings(block.children))
    }
  }

  return headings
}

function groupListItems(blocks: BlockWithChildren[]) {
  type Group =
    | {
        kind: "list"
        listType: "bulleted_list_item" | "numbered_list_item" | "to_do"
        items: BlockWithChildren[]
      }
    | { kind: "block"; block: BlockWithChildren }

  const groups: Group[] = []

  for (const block of blocks) {
    if (
      block.type === "bulleted_list_item" ||
      block.type === "numbered_list_item" ||
      block.type === "to_do"
    ) {
      const last = groups[groups.length - 1]
      if (last?.kind === "list" && last.listType === block.type) {
        last.items.push(block)
      } else {
        groups.push({ kind: "list", listType: block.type, items: [block] })
      }
    } else {
      groups.push({ kind: "block", block })
    }
  }

  return groups
}

function NotionRenderer({ blocks }: { blocks: BlockWithChildren[] }) {
  const groups = groupListItems(blocks)

  return (
    <div className="space-y-4">
      {groups.map((group, index) => {
        if (group.kind === "list") {
          const ListTag = group.listType === "numbered_list_item" ? "ol" : "ul"
          return (
            <ListTag
              key={index}
              className={cn(
                "space-y-1",
                group.listType === "bulleted_list_item" && "list-disc pl-6",
                group.listType === "numbered_list_item" && "list-decimal pl-6",
                group.listType === "to_do" && "list-none"
              )}
            >
              {group.items.map((item) => (
                <NotionBlock key={item.id} block={item} />
              ))}
            </ListTag>
          )
        }

        return <NotionBlock key={group.block.id} block={group.block} />
      })}
    </div>
  )
}

export { NotionRenderer, extractHeadings }
