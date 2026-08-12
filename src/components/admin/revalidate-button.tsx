"use client"

import { useTransition } from "react"
import { RefreshCw } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function RevalidateButton({
  action,
  label = "재검증",
}: {
  action: () => Promise<void>
  label?: string
}) {
  const [pending, startTransition] = useTransition()

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await action()
          toast.success("재검증되었습니다.")
        })
      }
    >
      <RefreshCw className={cn("size-4", pending && "animate-spin")} />
      {label}
    </Button>
  )
}
