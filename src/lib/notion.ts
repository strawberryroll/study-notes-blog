import { Client, isFullPage } from "@notionhq/client"
import type { BlockObjectResponse } from "@notionhq/client/build/src/api-endpoints/blocks"
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints/common"

const notion = new Client({ auth: process.env.NOTION_API_KEY })

type TitleProp = { title: Array<{ plain_text: string }> }
type RichTextProp = { rich_text: Array<{ plain_text: string }> }
type MultiSelectProp = { multi_select: Array<{ name: string }> }
type DateProp = { date: { start: string } | null }
type SelectProp = { select: { name: string } | null }
type FilesProp = {
  files: Array<
    | { type: "file"; file: { url: string } }
    | { type: "external"; external: { url: string } }
  >
}

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

export async function getCourses(): Promise<Course[]> {
  const response = await notion.dataSources.query({
    data_source_id: process.env.NOTION_DATABASE_ID!,
  })

  return response.results.filter(isFullPage).map((page) => {
    const props = (page as PageObjectResponse).properties

    const title = (props.Title as unknown as TitleProp).title[0]?.plain_text ?? ""
    const databaseId = (props.DatabaseId as unknown as RichTextProp).rich_text[0]?.plain_text ?? ""
    const description = (props.Description as unknown as RichTextProp).rich_text[0]?.plain_text ?? ""

    const files = (props.Thumbnail as unknown as FilesProp).files
    const file = files[0]
    const thumbnail =
      file?.type === "file"
        ? file.file.url
        : file?.type === "external"
          ? file.external.url
          : null

    return { id: page.id, title, databaseId, description, thumbnail }
  })
}

export async function getNotes(databaseId: string): Promise<Note[]> {
  const response = await notion.dataSources.query({
    data_source_id: databaseId,
    filter: {
      property: "Status",
      select: { equals: "발행됨" },
    },
    sorts: [{ property: "Published", direction: "descending" }],
  })

  return response.results.filter(isFullPage).map((page) => {
    const props = (page as PageObjectResponse).properties

    const title = (props.Title as unknown as TitleProp).title[0]?.plain_text ?? ""
    const tags = (props.Tags as unknown as MultiSelectProp).multi_select.map((t) => t.name)
    const published = (props.Published as unknown as DateProp).date?.start ?? ""
    const status = (props.Status as unknown as SelectProp).select?.name ?? ""

    return { id: page.id, title, tags, published, status }
  })
}

export async function getNote(
  noteId: string
): Promise<{ page: Note; blocks: BlockObjectResponse[] }> {
  const [pageResponse, blocksResponse] = await Promise.all([
    notion.pages.retrieve({ page_id: noteId }),
    notion.blocks.children.list({ block_id: noteId }),
  ])

  if (!isFullPage(pageResponse)) {
    throw new Error(`Note not found: ${noteId}`)
  }

  const props = (pageResponse as PageObjectResponse).properties

  const title = (props.Title as unknown as TitleProp).title[0]?.plain_text ?? ""
  const tags = (props.Tags as unknown as MultiSelectProp).multi_select.map((t) => t.name)
  const published = (props.Published as unknown as DateProp).date?.start ?? ""
  const status = (props.Status as unknown as SelectProp).select?.name ?? ""

  const page: Note = { id: pageResponse.id, title, tags, published, status }
  const blocks = blocksResponse.results.filter(
    (b): b is BlockObjectResponse => "type" in b
  )

  return { page, blocks }
}
