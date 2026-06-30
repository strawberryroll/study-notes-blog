interface Props {
  params: Promise<{ courseId: string; noteId: string }>
}

export const revalidate = 60

export default async function NoteDetailPage({ params }: Props) {
  const { courseId, noteId } = await params

  return (
    <div>
      노트 상세 페이지 (준비 중) - {courseId}/{noteId}
    </div>
  )
}
