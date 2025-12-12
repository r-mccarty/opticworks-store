import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import {
  registerCustomer,
  createCustomerProfile,
  getCurrentCustomer,
} from '@/lib/api/medusa'
import { buildRateLimitKey, rateLimit } from '@/lib/rate-limit'

const AUTH_COOKIE_NAME = 'medusa_auth_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

interface RegisterRequest {
  email: string
  password: string
  first_name?: string
  last_name?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as RegisterRequest
    const { email, password, first_name, last_name } = body

    // Rate limit registration attempts per IP
    const limitKey = buildRateLimitKey("auth-register", request)
    const limitResult = rateLimit(limitKey, { limit: 10, windowMs: 5 * 60 * 1000 })
    if (!limitResult.success) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Step 1: Register with Medusa to get JWT token
    let token: string
    try {
      const authResponse = await registerCustomer(email, password)
      token = authResponse.token
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed'

      // Check if user already exists
      if (message.includes('409') || message.includes('already exists')) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        )
      }

      console.error('[auth/register] Registration error:', message)
      return NextResponse.json(
        { error: 'Registration failed. Please try again.' },
        { status: 500 }
      )
    }

    // Step 2: Create customer profile
    try {
      await createCustomerProfile(token, {
        email,
        first_name,
        last_name,
      })
    } catch (error) {
      console.error('[auth/register] Profile creation error:', error)
      // Continue anyway - the auth identity exists even if profile creation fails
    }

    // Step 3: Fetch full customer data
    let customer
    try {
      const customerResponse = await getCurrentCustomer(token)
      customer = customerResponse.customer
    } catch (error) {
      console.error('[auth/register] Fetch customer error:', error)
      // Return minimal customer data if fetch fails
      customer = {
        id: '',
        email,
        first_name: first_name || null,
        last_name: last_name || null,
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
    console.error('[auth/register] Unexpected error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    )
  }
}
