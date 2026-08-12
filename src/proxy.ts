import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { verifySession, ADMIN_SESSION_COOKIE } from "@/lib/admin-auth"

export const config = {
  matcher: ["/admin/:path*"],
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === "/admin/login") {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const valid = await verifySession(token)

  if (!valid) {
    const loginUrl = new URL("/admin/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}
