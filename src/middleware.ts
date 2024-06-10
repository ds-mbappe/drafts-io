import { NextResponse } from 'next/server'
import { withAuth } from "next-auth/middleware";
export default withAuth(
  async function middleware(req) {
    const {
      nextUrl: { pathname },
      nextauth: { token },
    } = req;

    const tokenEmail = req.cookies.get('token')?.value || ''

    if (pathname.startsWith("/account") && (token || tokenEmail)) {
      return NextResponse.redirect(new URL("/app", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const {
          nextUrl: { pathname },
        } = req;

        const tokenEmail = req.cookies.get('token')?.value || ''

        return (!(token || tokenEmail) && pathname.startsWith("/account")) || !!(token || tokenEmail);
      },
    },
  }
);

// export function middleware(request: NextRequest) {
//   const path = request.nextUrl.pathname

//   // Define paths that are considered public (accessible without a token)
//   const isPublicPath = path === '/account/sign-in' || path === '/account/sign-up' || path === '/account/verifyemail'

//   // Get the token from the cookies
//   const token = request.cookies.get('token')?.value || ''

//   // Redirect logic based on the path and token presence
//   if(isPublicPath && token) {

//   // If trying to access a public path with a token, redirect to the home page
//     return NextResponse.redirect(new URL('/app', request.nextUrl))
//   }

//   // If trying to access a secure path without a token, redirect to the login page
//   if (!isPublicPath && !token) {
//     return NextResponse.redirect(new URL('/account/sign-in', request.nextUrl))
//   }
// }

// It specifies the paths for which this middleware should be executed. 
// In this case, it's applied to '/app', '/sign-in', and '/sign-up'.
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$).*)",
  ],
}