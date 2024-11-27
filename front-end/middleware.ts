import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  // const url = request.nextUrl
  const token = request.cookies.get('token')?.value

  if (!token) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  let auth = null

  try {
    auth = await fetch(`${baseUrl}/user/auth`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json())
  } catch (error) {
    console.log(error)
  }

  if (auth?.code !== 200) {
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.delete('token')
    return response
  }
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/home/:path*',
}
