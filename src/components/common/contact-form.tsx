"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useWatch } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  name: z.string().min(2, "이름은 2자 이상이어야 합니다."),
  email: z.email("올바른 이메일 주소를 입력해주세요."),
  message: z.string().min(10, "메시지는 10자 이상이어야 합니다."),
  agree: z.boolean().refine((value) => value, {
    message: "약관에 동의해야 제출할 수 있습니다.",
  }),
})

type FormValues = z.infer<typeof formSchema>

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", email: "", message: "", agree: false },
  })

  const agree = useWatch({ control, name: "agree" })

  function onSubmit(values: FormValues) {
    toast.success("메시지가 전송되었습니다.", {
      description: `${values.name}님, 감사합니다!`,
    })
    reset()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field data-invalid={!!errors.name}>
          <FieldLabel htmlFor="name">이름</FieldLabel>
          <Input id="name" {...register("name")} aria-invalid={!!errors.name} />
          <FieldError errors={[errors.name]} />
        </Field>

        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">이메일</FieldLabel>
          <Input
            id="email"
            type="email"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
          <FieldError errors={[errors.email]} />
        </Field>

        <Field data-invalid={!!errors.message}>
          <FieldLabel htmlFor="message">메시지</FieldLabel>
          <Textarea
            id="message"
            rows={4}
            {...register("message")}
            aria-invalid={!!errors.message}
          />
          <FieldError errors={[errors.message]} />
        </Field>

        <Field
          orientation="horizontal"
          data-invalid={!!errors.agree}
        >
          <Checkbox
            id="agree"
            checked={agree}
            onCheckedChange={(checked) => setValue("agree", checked === true)}
          />
          <FieldLabel htmlFor="agree" className="font-normal">
            개인정보 수집 및 이용에 동의합니다.
          </FieldLabel>
          <FieldError errors={[errors.agree]} />
        </Field>

        <Button type="submit" disabled={isSubmitting}>
          제출
        </Button>
      </FieldGroup>
    </form>
  )
}
