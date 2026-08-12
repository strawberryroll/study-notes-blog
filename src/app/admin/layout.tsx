import { AdminNav } from "@/components/admin/admin-nav"
import { Container } from "@/components/layout/container"

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <AdminNav />
      <main className="flex-1 py-8">
        <Container>{children}</Container>
      </main>
    </>
  )
}
