import { auth } from "./auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const session = await auth()

  const isLoggedIn = !!session?.user
  const { pathname } = req.nextUrl

  const isAuthPage = pathname === "/account/sign-in" || pathname === "/account/sign-up"
  const isProtectedPage = pathname.startsWith("/app")

  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/app", req.url))
  }

  if (!isLoggedIn && isProtectedPage) {
    return NextResponse.redirect(new URL("/account/sign-in", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ],
}