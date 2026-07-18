"use client"

import { useEffect, useState } from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { Heading } from "@/components/common/notion-renderer"

// notion-renderer.tsx의 heading에 적용된 scroll-mt-24(6rem = 96px)와 맞춰
// anchor 스크롤 직후에도 도착한 heading이 정확히 활성화되도록 함
const SCROLL_OFFSET_PX = 96

function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    function updateActiveHeading() {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1

      if (atBottom) {
        setActiveId(elements[elements.length - 1].id)
        return
      }

      let current: HTMLElement | null = null

      for (const el of elements) {
        if (el.getBoundingClientRect().top <= SCROLL_OFFSET_PX) {
          current = el
        } else {
          break
        }
      }

      setActiveId((current ?? elements[0]).id)
    }

    updateActiveHeading()
    window.addEventListener("scroll", updateActiveHeading, { passive: true })
    window.addEventListener("resize", updateActiveHeading)

    return () => {
      window.removeEventListener("scroll", updateActiveHeading)
      window.removeEventListener("resize", updateActiveHeading)
    }
  }, [headings])

  if (headings.length === 0) return null

  const list = (
    <nav aria-label="목차">
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li key={heading.id} style={{ paddingLeft: (heading.level - 1) * 12 }}>
            <a
              href={`#${heading.id}`}
              className={cn(
                "block text-muted-foreground transition-colors hover:text-foreground",
                activeId === heading.id && "font-medium text-foreground"
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <>
      <div className="hidden lg:sticky lg:top-24 lg:block">{list}</div>
      <div className="lg:hidden">
        <Accordion type="single" collapsible>
          <AccordionItem value="toc">
            <AccordionTrigger>목차</AccordionTrigger>
            <AccordionContent>{list}</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  )
}

export { TableOfContents }
