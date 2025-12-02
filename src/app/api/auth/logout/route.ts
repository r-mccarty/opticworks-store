import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const AUTH_COOKIE_NAME = 'medusa_auth_token'

export async function POST() {
  try {
    // Clear the auth cookie
    const cookieStore = await cookies()
    cookieStore.delete(AUTH_COOKIE_NAME)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[auth/logout] Error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
