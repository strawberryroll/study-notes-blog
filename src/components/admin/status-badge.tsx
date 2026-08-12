import { Badge } from "@/components/ui/badge"

const STATUS_VARIANT: Record<
  string,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  대기: "outline",
  초안: "secondary",
  발행됨: "default",
}

export function StatusBadge({ status }: { status: string }) {
  const variant = STATUS_VARIANT[status] ?? "outline"
  return <Badge variant={variant}>{status || "미지정"}</Badge>
}
