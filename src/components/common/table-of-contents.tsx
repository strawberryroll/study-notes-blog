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

function TableOfContents({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting)
        if (visible) setActiveId(visible.target.id)
      },
      { rootMargin: "-80px 0px -70% 0px" }
    )

    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
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
