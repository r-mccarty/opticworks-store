"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isLoading, error } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const success = await login(formData.email, formData.password)

    if (success) {
      // Redirect to the intended page or account dashboard
      const redirectTo = searchParams.get("redirect") || "/account"
      router.push(redirectTo)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
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
          value={formData.email}
          onChange={handleChange}
          placeholder="john@example.com"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link
            href="/auth/forgot-password"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          required
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-foreground hover:underline">
          Create one
        </Link>
      </p>
    </form>
  )
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 text-foreground">
            Welcome back
          </h1>
          <p className="text-muted-foreground">
            Sign in to track orders and manage devices.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-elevation-1">
          <Suspense fallback={<div className="text-muted-foreground text-center">Loading...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  )
}
