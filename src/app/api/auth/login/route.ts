import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { loginCustomer, getCurrentCustomer } from '@/lib/api/medusa'
import { buildRateLimitKey, rateLimit } from '@/lib/rate-limit'

const AUTH_COOKIE_NAME = 'medusa_auth_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

interface LoginRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as LoginRequest
    const { email, password } = body

    // Rate limit login attempts per IP
    const limitKey = buildRateLimitKey("auth-login", request)
    const limitResult = rateLimit(limitKey, { limit: 10, windowMs: 5 * 60 * 1000 })
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': Math.ceil(limitResult.retryAfter / 1000).toString() } }
      )
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Step 1: Authenticate with Medusa
    let token: string
    try {
      const authResponse = await loginCustomer(email, password)
      token = authResponse.token
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed'

      // Check for invalid credentials
      if (message.includes('401') || message.includes('unauthorized') || message.includes('Invalid')) {
        return NextResponse.json(
          { error: 'Invalid email or password' },
          { status: 401 }
        )
      }

      console.error('[auth/login] Login error:', message)
      return NextResponse.json(
        { error: 'Login failed. Please try again.' },
        { status: 500 }
      )
    }

    // Step 2: Fetch customer data
    let customer
    try {
      const customerResponse = await getCurrentCustomer(token)
      customer = customerResponse.customer
    } catch (error) {
      console.error('[auth/login] Fetch customer error:', error)
      // Return minimal customer data if fetch fails
      customer = {
        id: '',
        email,
        first_name: null,
        last_name: null,
        phone: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    // Set httpOnly cookie with the token
    const cookieStore = await cookies()
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: COOKIE_MAX_AGE,
      path: '/',
    })

    return NextResponse.json({
      success: true,
      customer,
    })
  } catch (error) {
    console.error('[auth/login] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
