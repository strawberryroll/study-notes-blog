import { CourseCard } from "@/components/common/course-card"
import { Container } from "@/components/layout/container"
import { getCourses } from "@/lib/notion"

export const revalidate = 60

export default async function Home() {
  const courses = await getCourses()

  return (
    <Container className="py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight">강의 목록</h1>
        <p className="mt-2 text-muted-foreground">
          강의를 수강하며 정리한 복습 노트를 확인해보세요.
        </p>
      </div>

      {courses.length === 0 ? (
        <p className="text-muted-foreground">등록된 강의가 없습니다.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </Container>
  )
}
