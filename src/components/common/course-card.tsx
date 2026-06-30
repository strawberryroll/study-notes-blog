import Image from "next/image"
import Link from "next/link"

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Course } from "@/lib/notion"

function CourseCard({ course }: { course: Course }) {
  return (
    <Link href={`/courses/${course.id}`} className="block">
      <Card className="h-full transition-colors hover:bg-accent/50">
        {course.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
          {course.description && (
            <CardDescription>{course.description}</CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  )
}

export { CourseCard }
