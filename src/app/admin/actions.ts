"use server"

import { timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import {
  signSession,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
} from "@/lib/admin-auth"

export type LoginState = { error?: string }

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "")
  const expected = process.env.ADMIN_PASSWORD ?? ""

  const a = Buffer.from(password)
  const b = Buffer.from(expected)
  const match = a.length === b.length && timingSafeEqual(a, b)

  if (!match) {
    return { error: "비밀번호가 올바르지 않습니다." }
  }

  const token = await signSession(ADMIN_SESSION_TTL_SECONDS)
  const cookieStore = await cookies()
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/admin",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  })

  const redirectTo = String(formData.get("redirect") || "/admin")
  redirect(redirectTo.startsWith("/admin") ? redirectTo : "/admin")
}

export async function logoutAction() {
  const cookieStore = await cookies()
  cookieStore.delete({ name: ADMIN_SESSION_COOKIE, path: "/admin" })
  redirect("/admin/login")
}
