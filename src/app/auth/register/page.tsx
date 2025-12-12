"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function RegisterPage() {
  const router = useRouter()
  const { register, isLoading, error } = useAuth()

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  })
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setValidationError("Passwords do not match")
      return
    }

    if (formData.password.length < 8) {
      setValidationError("Password must be at least 8 characters")
      return
    }

    const success = await register(
      formData.email,
      formData.password,
      formData.firstName || undefined,
      formData.lastName || undefined
    )

    if (success) {
      router.push("/account")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const displayError = validationError || error

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold mb-2 text-foreground">
            Create account
          </h1>
          <p className="text-muted-foreground">
            Manage orders, subscriptions, and device access in one place.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 shadow-elevation-1">
          <form onSubmit={handleSubmit} className="space-y-5">
            {displayError && (
              <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {displayError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                  autoComplete="given-name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Doe"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
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
              <Label htmlFor="password">
                Password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                Confirm password <span className="text-destructive">*</span>
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
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
