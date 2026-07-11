"use client"

import { useState } from "react"
import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

function LinkPreviewImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex size-full items-center justify-center bg-muted">
        <ImageOff className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- OG 이미지는 임의 외부 도메인이라 next/image 최적화 대상이 아님
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      className={cn(
        "size-full object-cover transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0"
      )}
    />
  )
}

export { LinkPreviewImage }
