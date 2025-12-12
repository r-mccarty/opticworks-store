"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to send reset email")
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="rounded-lg border border-border bg-card p-8 shadow-elevation-1 text-center">
            <div className="mb-6 flex size-14 items-center justify-center rounded-full bg-secondary/15 mx-auto">
              <svg
                className="size-7 text-secondary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Check your email
            </h1>
            <p className="text-muted-foreground">
              If an account exists for{" "}
              <span className="text-foreground">{email}</span>, you&apos;ll
              receive a reset link shortly.
            </p>

            <div className="mt-6 space-y-3">
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check spam or try again.
              </p>
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail("")
                }}
                variant="outline"
                className="w-full"
              >
                Try again
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/auth/login">Back to sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-foreground mb-2">
            Reset password
          </h1>
          <p className="text-muted-foreground">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-elevation-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                autoComplete="email"
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Sending..." : "Send reset link"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Remember your password?{" "}
              <Link href="/auth/login" className="text-foreground hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}
