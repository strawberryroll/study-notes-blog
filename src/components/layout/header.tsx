import { Logo } from "@/components/common/logo"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Container } from "@/components/layout/container"
import { MainNav } from "@/components/layout/main-nav"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container className="flex h-14 items-center justify-between">
        <Logo />
        <div className="flex items-center gap-2">
          <MainNav />
          <ThemeToggle />
        </div>
      </Container>
    </header>
  )
}
