"use client"

import { useActionState } from "react"

import { loginAction } from "@/app/admin/actions"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(loginAction, {})

  return (
    <form action={formAction}>
      <FieldGroup>
        <input type="hidden" name="redirect" value={redirectTo} />
        <Field data-invalid={!!state.error}>
          <FieldLabel htmlFor="password">비밀번호</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            aria-invalid={!!state.error}
          />
          <FieldError errors={state.error ? [{ message: state.error }] : []} />
        </Field>

        <Button type="submit" disabled={pending}>
          로그인
        </Button>
      </FieldGroup>
    </form>
  )
}
