import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const token = request.cookies.get('token')?.value
  const baseUrl = process.env.BASE_URL
  const auth = await fetch(`${baseUrl}/user/auth`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json())

  if (auth.code !== 200) {
    url.pathname = '/login'
    return NextResponse.rewrite(url)
  }
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/home/:path*',
}
