import { highlightCode } from "@/lib/shiki-highlighter"

function PlainCodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-sm">
      <code>{code}</code>
    </pre>
  )
}

async function HighlightedCodeBlock({
  code,
  language,
}: {
  code: string
  language: string
}) {
  const html = await highlightCode(code, language)

  if (!html) {
    return <PlainCodeBlock code={code} />
  }

  return (
    <div
      className="overflow-x-auto rounded-lg bg-muted p-4 text-sm [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export { PlainCodeBlock, HighlightedCodeBlock }
