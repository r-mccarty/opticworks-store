"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  getSavedPaymentMethods,
  deletePaymentMethod,
  getCardBrandDisplay,
  formatCardExpiry,
  type SavedPaymentMethod,
} from "@/lib/api/payment-methods"

/**
 * SavedPaymentMethods component
 *
 * Displays a card on the account page showing the customer's saved payment methods.
 * Allows viewing card details and deleting saved cards.
 */
export function SavedPaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadPaymentMethods = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const methods = await getSavedPaymentMethods()
      setPaymentMethods(methods)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load payment methods"
      setError(message)
      console.error("[SavedPaymentMethods] Load error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPaymentMethods()
  }, [loadPaymentMethods])

  const handleDelete = async (paymentMethodId: string) => {
    if (deletingId) return // Prevent double-click

    try {
      setDeletingId(paymentMethodId)
      setError(null)
      await deletePaymentMethod(paymentMethodId)
      // Remove from local state
      setPaymentMethods((prev) => prev.filter((m) => m.id !== paymentMethodId))
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete payment method"
      setError(message)
      console.error("[SavedPaymentMethods] Delete error:", err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <h2 className="text-xl font-semibold text-foreground mb-4">Payment Methods</h2>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-sm text-destructive">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadPaymentMethods}
            className="mt-2 text-destructive hover:text-destructive"
          >
            Try again
          </Button>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2 text-muted-foreground">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && paymentMethods.length === 0 && (
        <p className="text-muted-foreground">
          No saved payment methods. Your cards will be saved automatically during checkout.
        </p>
      )}

      {/* Payment methods list */}
      {!isLoading && paymentMethods.length > 0 && (
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const card = method.data.card
            if (!card) return null

            return (
              <div
                key={method.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-background"
              >
                <div className="flex items-center gap-4">
                  {/* Card icon */}
                  <div className="w-10 h-6 bg-muted rounded flex items-center justify-center">
                    <CardIcon brand={card.brand} />
                  </div>

                  {/* Card details */}
                  <div>
                    <p className="font-medium text-foreground">
                      {getCardBrandDisplay(card.brand)} ending in {card.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {formatCardExpiry(card.exp_month, card.exp_year)}
                    </p>
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(method.id)}
                  disabled={deletingId === method.id}
                  className="text-muted-foreground hover:text-destructive"
                >
                  {deletingId === method.id ? (
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <TrashIcon />
                  )}
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/**
 * Simple card brand icon
 */
function CardIcon({ brand }: { brand: string }) {
  // Show first letter of brand as a simple indicator
  const initial = brand.charAt(0).toUpperCase()

  return (
    <span className="text-xs font-semibold text-muted-foreground">
      {initial}
    </span>
  )
}

/**
 * Trash icon for delete button
 */
function TrashIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  )
}
