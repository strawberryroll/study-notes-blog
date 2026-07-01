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
      <Card className="h-full transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5 hover:ring-foreground/20">
        {course.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={course.thumbnail}
              alt={course.title}
              fill
              className="object-cover transition-transform duration-500 group-hover/card:scale-105"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            />
          </div>
        )}
        <CardHeader>
          <CardTitle className="text-lg font-semibold tracking-tight sm:text-xl">
            {course.title}
          </CardTitle>
          {course.description && (
            <CardDescription className="line-clamp-2">
              {course.description}
            </CardDescription>
          )}
        </CardHeader>
      </Card>
    </Link>
  )
}

export { CourseCard }
