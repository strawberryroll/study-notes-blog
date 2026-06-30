interface Props {
  params: Promise<{ courseId: string }>
}

export const revalidate = 60

export default async function CourseNotesPage({ params }: Props) {
  const { courseId } = await params

  return <div>노트 목록 페이지 (준비 중) - {courseId}</div>
}
