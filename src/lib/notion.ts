import { cache } from "react"
import { Client, isFullPage } from "@notionhq/client"
import type {
  BlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints"

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export type Course = {
  id: string
  title: string
  databaseId: string
  description: string
  thumbnail: string | null
}

export type Note = {
  id: string
  title: string
  tags: string[]
  published: string
  status: string
}

export type { BlockObjectResponse }

function getProp(page: PageObjectResponse, name: string) {
  return page.properties[name]
}

function extractTitle(prop: ReturnType<typeof getProp>): string {
  if (prop?.type !== "title") return ""
  return (prop.title as Array<{ plain_text: string }>).map((t) => t.plain_text).join("")
}

function extractRichText(prop: ReturnType<typeof getProp>): string {
  if (prop?.type !== "rich_text") return ""
  return (prop.rich_text as Array<{ plain_text: string }>).map((t) => t.plain_text).join("")
}

function extractMultiSelect(prop: ReturnType<typeof getProp>): string[] {
  if (prop?.type !== "multi_select") return []
  return (prop.multi_select as Array<{ name: string }>).map((t) => t.name)
}

function extractDate(prop: ReturnType<typeof getProp>): string {
  if (prop?.type !== "date") return ""
  return (prop.date as { start: string } | null)?.start ?? ""
}

function extractSelect(prop: ReturnType<typeof getProp>): string {
  if (prop?.type === "select") return (prop.select as { name: string } | null)?.name ?? ""
  if (prop?.type === "status") return (prop.status as { name: string } | null)?.name ?? ""
  return ""
}

function extractThumbnail(prop: ReturnType<typeof getProp>): string | null {
  if (prop?.type !== "files") return null
  const files = prop.files as Array<
    | { type: "file"; file: { url: string } }
    | { type: "external"; external: { url: string } }
  >
  const file = files[0]
  if (!file) return null
  return file.type === "file" ? file.file.url : file.external.url
}

export const getCourses = cache(async (): Promise<Course[]> => {
  const { results } = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID!,
  })

  return results.filter(isFullPage).map((page) => ({
    id: page.id,
    title: extractTitle(getProp(page, "Title")),
    databaseId: extractRichText(getProp(page, "DatabaseId")),
    description: extractRichText(getProp(page, "Description")),
    thumbnail: extractThumbnail(getProp(page, "Thumbnail")),
  }))
})

export async function getNotes(databaseId: string): Promise<Note[]> {
  const { results } = await notion.databases.query({
    database_id: databaseId,
    filter: { property: "Status", status: { equals: "발행됨" } },
    sorts: [{ property: "Published", direction: "descending" }],
  })

  return results.filter(isFullPage).map((page) => ({
    id: page.id,
    title: extractTitle(getProp(page, "Title")),
    tags: extractMultiSelect(getProp(page, "Tags")),
    published: extractDate(getProp(page, "Published")),
    status: extractSelect(getProp(page, "Status")),
  }))
}

export async function getAdjacentNotes(
  databaseId: string,
  noteId: string
): Promise<{ prev: Note | null; next: Note | null }> {
  const notes = await getNotes(databaseId)
  const index = notes.findIndex((n) => n.id === noteId)

  if (index === -1) return { prev: null, next: null }

  return {
    prev: notes[index + 1] ?? null,
    next: notes[index - 1] ?? null,
  }
}

export const getNote = cache(
  async (
    noteId: string
  ): Promise<{ page: Note; blocks: BlockObjectResponse[] }> => {
    const [pageResponse, { results }] = await Promise.all([
      notion.pages.retrieve({ page_id: noteId }),
      notion.blocks.children.list({ block_id: noteId }),
    ])

    if (!isFullPage(pageResponse)) throw new Error(`Note not found: ${noteId}`)

    return {
      page: {
        id: pageResponse.id,
        title: extractTitle(getProp(pageResponse, "Title")),
        tags: extractMultiSelect(getProp(pageResponse, "Tags")),
        published: extractDate(getProp(pageResponse, "Published")),
        status: extractSelect(getProp(pageResponse, "Status")),
      },
      blocks: results.filter((b): b is BlockObjectResponse => "type" in b),
    }
  }
)
