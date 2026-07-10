"use client"

import { useState } from "react"
import Image from "next/image"
import { ImageOff } from "lucide-react"

import { cn } from "@/lib/utils"

function NotionImage({ src, alt }: { src: string; alt: string }) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <ImageOff className="size-5" aria-hidden="true" />
        이미지를 불러올 수 없습니다
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 850px, 100vw"
      className={cn(
        "object-contain transition-opacity duration-300",
        loaded ? "opacity-100" : "opacity-0"
      )}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
    />
  )
}

export { NotionImage }
