import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCurrentCustomer } from '@/lib/api/medusa'

const AUTH_COOKIE_NAME = 'medusa_auth_token'

export async function GET() {
  try {
    // Get the auth token from cookie
    const cookieStore = await cookies()
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Fetch customer from Medusa
    try {
      const customerResponse = await getCurrentCustomer(token)
      return NextResponse.json({
        customer: customerResponse.customer,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch customer'

      // Token might be expired or invalid
      if (message.includes('401') || message.includes('unauthorized')) {
        // Clear the invalid cookie
        cookieStore.delete(AUTH_COOKIE_NAME)
        return NextResponse.json(
          { error: 'Session expired' },
          { status: 401 }
        )
      }

      console.error('[auth/me] Fetch customer error:', message)
      return NextResponse.json(
        { error: 'Failed to fetch customer data' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('[auth/me] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
