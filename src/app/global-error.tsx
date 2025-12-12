"use client"

/**
 * Global Error Handler for Next.js App Router
 *
 * This component catches errors that occur in the root layout
 * and provides a fallback UI while reporting to Sentry.
 *
 * Note: This is a special error boundary that wraps the entire app.
 * It must render its own <html> and <body> tags since it replaces
 * the root layout when an error occurs.
 */
import * as Sentry from "@sentry/nextjs"
import Link from "next/link"
import { useEffect } from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Report to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: "global",
        digest: error.digest,
      },
    })
  }, [error])

  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100">
        <div className="flex min-h-screen flex-col items-center justify-center px-4">
          <div className="text-center max-w-md">
            <h1 className="text-4xl font-bold mb-4">Something went wrong</h1>
            <p className="text-neutral-400 mb-8">
              We apologize for the inconvenience. Our team has been notified and
              is working to fix the issue.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={reset}
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Try again
              </button>
              <Link
                href="/"
                className="border border-neutral-700 text-neutral-100 px-6 py-3 rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Go home
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
