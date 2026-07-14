import { Link2 } from "lucide-react"

import { LinkPreviewImage } from "@/components/common/link-preview-image"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getLinkPreview } from "@/lib/link-preview"
import { extractPlainText } from "@/lib/notion"

function MinimalBookmarkCard({
  url,
  caption,
}: {
  url: string
  caption: { plain_text: string }[]
}) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="transition-colors hover:bg-muted/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-normal text-muted-foreground">
            <Link2 className="size-4 shrink-0" aria-hidden="true" />
            {url}
          </CardTitle>
        </CardHeader>
      </Card>
      {caption.length > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">{extractPlainText(caption)}</p>
      )}
    </a>
  )
}

async function BookmarkCard({
  url,
  caption,
}: {
  url: string
  caption: { plain_text: string }[]
}) {
  const preview = await getLinkPreview(url)

  if (!preview) {
    return <MinimalBookmarkCard url={url} caption={caption} />
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block">
      <Card className="overflow-hidden transition-colors hover:bg-muted/50 sm:flex-row">
        {preview.image && (
          <div className="relative aspect-video w-full shrink-0 overflow-hidden bg-muted sm:aspect-square sm:w-40">
            <LinkPreviewImage src={preview.image} alt={preview.title ?? url} />
          </div>
        )}
        <CardHeader className="min-w-0 flex-1">
          <CardTitle className="truncate text-sm font-medium">
            {preview.title ?? url}
          </CardTitle>
          {preview.description && (
            <CardDescription className="line-clamp-2">{preview.description}</CardDescription>
          )}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link2 className="size-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{preview.siteName ?? new URL(url).hostname}</span>
          </div>
        </CardHeader>
      </Card>
      {caption.length > 0 && (
        <p className="mt-1 text-sm text-muted-foreground">{extractPlainText(caption)}</p>
      )}
    </a>
  )
}

export { BookmarkCard, MinimalBookmarkCard }
