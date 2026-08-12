import { NotesTable } from "@/components/admin/notes-table"
import { getDashboardData } from "@/lib/notion"

export default async function AdminDashboardPage() {
  const data = await getDashboardData()

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        전체 강의의 노트 상태를 확인하고 관리합니다.
      </p>
      <div className="mt-6">
        <NotesTable data={data} />
      </div>
    </div>
  )
}
