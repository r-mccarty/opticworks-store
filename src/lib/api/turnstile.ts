/**
 * Cloudflare Turnstile verification utilities
 * Provides server-side verification for Turnstile CAPTCHA tokens
 */

interface TurnstileVerifyResponse {
  success: boolean
  "error-codes"?: string[]
  challenge_ts?: string
  hostname?: string
}

/**
 * Verify a Turnstile token with Cloudflare's API
 * @param token - The Turnstile token from the client
 * @param remoteip - Optional IP address of the user
 * @returns Promise<boolean> - True if verification succeeds
 */
export async function verifyTurnstileToken(
  token: string,
  remoteip?: string
): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY

  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not set")
    // In development, allow bypass if secret not set
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️  Turnstile verification skipped in development mode")
      return true
    }
    return false
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
          remoteip,
        }),
      }
    )

    const data: TurnstileVerifyResponse = await response.json()

    if (!data.success) {
      console.error("Turnstile verification failed:", data["error-codes"])
      return false
    }

    return true
  } catch (error) {
    console.error("Turnstile verification error:", error)
    return false
  }
}
