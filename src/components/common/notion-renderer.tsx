import Image from "next/image"

import { cn } from "@/lib/utils"
import type { BlockObjectResponse } from "@/lib/notion"

function extractPlainText(richText: { plain_text: string }[]): string {
  return richText.map((t) => t.plain_text).join("")
}

function NotionBlock({ block }: { block: BlockObjectResponse }) {
  switch (block.type) {
    case "paragraph": {
      const text = extractPlainText(block.paragraph.rich_text)
      if (!text) return <p className="h-4" aria-hidden="true" />
      return <p className="leading-7">{text}</p>
    }

    case "heading_1": {
      const text = extractPlainText(block.heading_1.rich_text)
      return (
        <h1 className="mt-8 text-2xl font-semibold tracking-tight first:mt-0">
          {text}
        </h1>
      )
    }

    case "heading_2": {
      const text = extractPlainText(block.heading_2.rich_text)
      return (
        <h2 className="mt-6 text-xl font-semibold tracking-tight first:mt-0">
          {text}
        </h2>
      )
    }

    case "heading_3": {
      const text = extractPlainText(block.heading_3.rich_text)
      return (
        <h3 className="mt-4 text-lg font-semibold tracking-tight first:mt-0">
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
      return (
        <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>{text}</code>
        </pre>
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

    case "image": {
      const image = block.image
      const src = image.type === "external" ? image.external.url : image.file.url
      const alt = extractPlainText(image.caption) || "노트 이미지"
      return (
        <figure className="space-y-2">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
            <Image src={src} alt={alt} fill className="object-contain" />
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

function groupListItems(blocks: BlockObjectResponse[]) {
  type Group =
    | { kind: "list"; listType: "bulleted_list_item" | "numbered_list_item"; items: BlockObjectResponse[] }
    | { kind: "block"; block: BlockObjectResponse }

  const groups: Group[] = []

  for (const block of blocks) {
    if (block.type === "bulleted_list_item" || block.type === "numbered_list_item") {
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

function NotionRenderer({ blocks }: { blocks: BlockObjectResponse[] }) {
  const groups = groupListItems(blocks)

  return (
    <div className="space-y-4">
      {groups.map((group, index) => {
        if (group.kind === "list") {
          const ListTag = group.listType === "bulleted_list_item" ? "ul" : "ol"
          return (
            <ListTag
              key={index}
              className={cn(
                "space-y-1 pl-6",
                group.listType === "bulleted_list_item" ? "list-disc" : "list-decimal"
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

export { NotionRenderer }
