import { Container } from "@/components/layout/container"

export function Footer() {
  return (
    <footer className="border-t border-border">
      <Container className="flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Study Notes. All rights reserved.
        </p>
      </Container>
    </footer>
  )
}
