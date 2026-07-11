export type LinkPreview = {
  title: string | null
  description: string | null
  image: string | null
  siteName: string | null
}

const FETCH_TIMEOUT_MS = 5000
const REVALIDATE_SECONDS = 60 * 60 * 24 * 7
const MAX_HTML_BYTES = 2_000_000

async function readBodyUpTo(res: Response, maxBytes: number): Promise<string> {
  if (!res.body) return res.text()

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let received = 0
  let result = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    received += value.byteLength
    result += decoder.decode(value, { stream: true })

    if (received >= maxBytes) {
      await reader.cancel()
      break
    }
  }

  return result
}

const HTML_ENTITIES: Record<string, string> = {
  "&quot;": '"',
  "&#34;": '"',
  "&apos;": "'",
  "&#39;": "'",
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&nbsp;": " ",
}

function decodeHtmlEntities(text: string): string {
  return text.replace(/&(quot|#34|apos|#39|amp|lt|gt|nbsp);/g, (entity) => HTML_ENTITIES[entity] ?? entity)
}

function extractMetaContent(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']*)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+property=["']${property}["']`,
      "i"
    ),
  ]

  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match) return decodeHtmlEntities(match[1])
  }

  return null
}

function parseOgTags(html: string): LinkPreview {
  return {
    title: extractMetaContent(html, "og:title"),
    description: extractMetaContent(html, "og:description"),
    image: extractMetaContent(html, "og:image"),
    siteName: extractMetaContent(html, "og:site_name"),
  }
}

export async function getLinkPreview(url: string): Promise<LinkPreview | null> {
  try {
    new URL(url)

    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
      headers: { "user-agent": "Mozilla/5.0 (compatible; LinkPreviewBot/1.0)" },
    })

    if (!res.ok) return null

    const contentType = res.headers.get("content-type") ?? ""
    if (!contentType.includes("text/html")) return null

    const html = await readBodyUpTo(res, MAX_HTML_BYTES)
    const preview = parseOgTags(html)

    if (preview.image) {
      try {
        preview.image = new URL(preview.image, url).toString()
      } catch {
        preview.image = null
      }
    }

    if (!preview.title && !preview.description && !preview.image) return null

    return preview
  } catch {
    return null
  }
}
