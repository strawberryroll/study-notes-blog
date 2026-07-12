import { createBundledHighlighter, createSingletonShorthands } from "shiki/core"
import { createOnigurumaEngine } from "shiki/engine/oniguruma"

const BundledLanguage = {
  javascript: () => import("@shikijs/langs/javascript"),
  typescript: () => import("@shikijs/langs/typescript"),
  tsx: () => import("@shikijs/langs/tsx"),
  jsx: () => import("@shikijs/langs/jsx"),
  python: () => import("@shikijs/langs/python"),
  bash: () => import("@shikijs/langs/bash"),
  json: () => import("@shikijs/langs/json"),
  css: () => import("@shikijs/langs/css"),
  html: () => import("@shikijs/langs/html"),
  sql: () => import("@shikijs/langs/sql"),
  markdown: () => import("@shikijs/langs/markdown"),
}

const BundledTheme = {
  "min-light": () => import("@shikijs/themes/min-light"),
  nord: () => import("@shikijs/themes/nord"),
}

const createHighlighter = createBundledHighlighter<
  keyof typeof BundledLanguage,
  keyof typeof BundledTheme
>({
  langs: BundledLanguage,
  themes: BundledTheme,
  engine: () => createOnigurumaEngine(() => import("shiki/wasm")),
})

const { codeToHtml } = createSingletonShorthands(createHighlighter)

type BundledLang = keyof typeof BundledLanguage

const NOTION_TO_SHIKI_LANG: Partial<Record<string, BundledLang>> = {
  // JSX 문법이 섞인 코드도 안전하게 처리하도록 typescript/javascript는 tsx/jsx grammar로 매핑
  typescript: "tsx",
  javascript: "jsx",
  python: "python",
  bash: "bash",
  shell: "bash",
  json: "json",
  css: "css",
  html: "html",
  sql: "sql",
  markdown: "markdown",
}

export async function highlightCode(code: string, notionLang: string): Promise<string | null> {
  const lang = NOTION_TO_SHIKI_LANG[notionLang]
  if (!lang) return null

  try {
    return await codeToHtml(code, {
      lang,
      themes: { light: "min-light", dark: "nord" },
    })
  } catch {
    return null
  }
}
