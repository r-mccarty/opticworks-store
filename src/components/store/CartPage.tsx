"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { useCart } from "@/hooks/useCart"
import { MinusIcon, PlusIcon, TrashIcon, CreditCardIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import CheckoutWrapper from "@/components/checkout/CheckoutWrapper"
import { useCheckoutState } from "@/hooks/useCheckoutState"
import { summarizeSpecifications } from "@/lib/cart/utils"
import type { MedusaCart } from "@/lib/api/medusa"
import { getCart as fetchMedusaCart } from "@/lib/api/medusa"

interface CartPageProps {
  /** Initial cart data from SSR (eliminates hydration mismatch) */
  initialCart?: MedusaCart | null
}

/**
 * Cart page component with SSR support.
 *
 * When initialCart is provided (from server), it hydrates the cart store
 * without the need for a loading spinner, eliminating hydration mismatch.
 *
 * @see Phase 4 of Architecture Audit
 */
export function CartPage({ initialCart }: CartPageProps) {
  const {
    items,
    updateQuantity,
    removeFromCart,
    getTotalPrice,
    clearCart,
    setPaymentSession,
    hydrateFromServer,
    getCartId,
    initializeCart,
  } = useCart()
  const { taxAmount, isCalculatingTax, reset: resetCheckout } = useCheckoutState()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [isHydrated, setIsHydrated] = useState(false)
  const [cartTotals, setCartTotals] = useState<{
    subtotal?: number
    tax_total?: number
    shipping_total?: number
    total?: number
  } | null>(initialCart ? {
    subtotal: initialCart.subtotal,
    tax_total: initialCart.tax_total,
    shipping_total: initialCart.shipping_total,
    total: initialCart.total,
  } : null)

  // Hydrate cart store from server data (eliminates loading spinner)
  useEffect(() => {
    let cancelled = false

    const hydrateCart = async () => {
      if (initialCart && hydrateFromServer) {
        hydrateFromServer(initialCart)
        if (!cancelled) {
          setCartTotals({
            subtotal: initialCart.subtotal,
            tax_total: initialCart.tax_total,
            shipping_total: initialCart.shipping_total,
            total: initialCart.total,
          })
          setIsHydrated(true)
        }
        return
      }

      // No SSR cart – initialize/sync client cart
      await initializeCart()
      const currentCartId = getCartId()

      if (currentCartId) {
        try {
          const latest = await fetchMedusaCart(currentCartId)
          if (!cancelled) {
            setCartTotals({
              subtotal: latest.subtotal,
              tax_total: latest.tax_total,
              shipping_total: latest.shipping_total,
              total: latest.total,
            })
          }
        } catch (error) {
          console.error("[cart] Failed to fetch cart totals:", error)
        }
      }

      if (!cancelled) {
        setIsHydrated(true)
      }
    }

    void hydrateCart()

    return () => {
      cancelled = true
    }
  }, [initialCart, hydrateFromServer, initializeCart, getCartId])

  // Refresh totals whenever cart items change (keeps UI aligned with Medusa)
  useEffect(() => {
    let cancelled = false
    const refreshTotals = async () => {
      const currentCartId = getCartId()
      if (!currentCartId) return
      try {
        const latest = await fetchMedusaCart(currentCartId)
        if (!cancelled) {
          setCartTotals({
            subtotal: latest.subtotal,
            tax_total: latest.tax_total,
            shipping_total: latest.shipping_total,
            total: latest.total,
          })
        }
      } catch (error) {
        console.error("[cart] Failed to refresh cart totals:", error)
      }
    }

    void refreshTotals()

    return () => {
      cancelled = true
    }
  }, [items.length, getCartId])

  const handlePaymentSuccess = (sessionId: string) => {
    console.log('Payment successful, setting session:', sessionId)
    setPaymentSession(sessionId)
    clearCart()
    resetCheckout()
    setShowPaymentForm(false)
    setIsCheckingOut(false)
    // Redirect to success page
    window.location.href = `/store/cart/success?session_id=${sessionId}`
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    setIsCheckingOut(false)
  }


  const handleProceedToPayment = () => {
    setIsCheckingOut(true)
    setShowPaymentForm(true)
  }

  // Show loading state only when SSR data not available and client not yet hydrated
  // With SSR cart loading, this should rarely show
  if (!isHydrated) {
    return (
      <main className="relative">
        <FadeContainer className="relative px-6 pt-28 pb-16 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Loading Cart...
              </h1>
              <div className="mt-8 flex justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        </FadeContainer>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="relative">
        <FadeContainer className="relative px-6 pt-28 pb-16 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <FadeDiv className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Your Cart is Empty
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Start shopping to add OpticWorks presence sensors, mounts, and dashboards to your cart.
              </p>
              <Button asChild className="mt-8">
                <Link href="/store">Continue Shopping</Link>
              </Button>
            </FadeDiv>
          </div>
        </FadeContainer>
      </main>
    )
  }

  const cartColumnBaseClass =
    items.length === 1
      ? "lg:col-span-4 lg:h-full"
      : items.length <= 3
      ? "lg:col-span-6 space-y-4"
      : "lg:col-span-7 space-y-4"

  const cartColumnClassName = `${cartColumnBaseClass} lg:sticky lg:top-32 lg:self-start`
  const featuredSpecs = items[0]?.specifications?.slice(0, 6) ?? []
  const summarySubtotal = cartTotals?.subtotal ?? getTotalPrice()
  const summaryShipping = typeof cartTotals?.shipping_total === "number" ? cartTotals.shipping_total : null
  const summaryTax = showPaymentForm
    ? (taxAmount || cartTotals?.tax_total || null)
    : (typeof cartTotals?.tax_total === "number" ? cartTotals.tax_total : null)
  const summaryTotal = typeof cartTotals?.total === "number"
    ? cartTotals.total
    : (showPaymentForm && summaryTax !== null ? getTotalPrice() + summaryTax : null)

  return (
    <main className="relative">
      <FadeContainer className="relative px-6 pt-28 pb-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Shopping Cart
            </h1>
          </FadeDiv>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:items-start">
            {/* Cart Items - Dynamic width based on item count */}
            <div className={cartColumnClassName}>
              {items.length === 1 ? (
                // Enhanced single item layout
                <FadeDiv key={items[0].id} className="h-full">
                  <Card className="h-full lg:min-h-[600px]">
                    <CardContent className="p-8 h-full flex flex-col justify-between">
                      {/* Product Header */}
                      <div className="flex-1 space-y-6">
                        {/* Large Product Image */}
                        <div className="flex justify-center">
                          <Link
                            href={`/products/${items[0].id}`}
                            className="relative w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-xl overflow-hidden bg-gray-100"
                          >
                            <Image
                              src={items[0].image}
                              alt={items[0].name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 128px, (max-width: 1024px) 160px, 192px"
                            />
                          </Link>
                        </div>
                        
                        {/* Product Information */}
                        <div className="text-center space-y-4">
                          <h3 className="text-xl lg:text-2xl font-bold text-gray-900">
                            <Link href={`/products/${items[0].id}`} className="hover:underline">
                              {items[0].name}
                            </Link>
                          </h3>
                          
                          {/* Rich Specifications */}
                          <div className="bg-gray-50 rounded-lg p-4 text-left">
                            <h4 className="font-semibold text-gray-900 mb-3">Specifications</h4>
                            {featuredSpecs.length > 0 ? (
                              <div className="grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                                {featuredSpecs.map((spec) => (
                                  <div key={spec.label} className="flex justify-between gap-4">
                                    <span>{spec.label}:</span>
                                    <span className="font-medium text-right">{spec.value}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">
                                Detailed specifications are available on the product page.
                              </p>
                            )}
                          </div>
                          
                          {/* Product Description */}
                          <div className="text-sm text-gray-600 leading-relaxed text-left">
                            {items[0].description}
                          </div>
                        </div>
                      </div>
                      
                      {/* Controls Section */}
                      <div className="mt-8 pt-6 border-t border-gray-200 space-y-4">
                        <div className="flex items-center justify-center space-x-4">
                          <div className="flex items-center border border-gray-300 rounded-lg">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(items[0].id, items[0].quantity - 1)}
                              className="h-10 w-10 p-0"
                            >
                              <MinusIcon className="h-5 w-5" />
                            </Button>
                            <Input
                              type="number"
                              value={items[0].quantity}
                              onChange={(e) => updateQuantity(items[0].id, parseInt(e.target.value) || 1)}
                              className="h-10 w-20 text-center border-0 bg-transparent font-semibold"
                              min="1"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => updateQuantity(items[0].id, items[0].quantity + 1)}
                              className="h-10 w-10 p-0"
                            >
                              <PlusIcon className="h-5 w-5" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFromCart(items[0].id)}
                            className="text-red-600 hover:text-red-700 h-10 px-4"
                          >
                            <TrashIcon className="h-5 w-5 mr-2" />
                            Remove
                          </Button>
                        </div>
                        
                        {/* Pricing */}
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-900">
                            ${(items[0].price * items[0].quantity).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            ${items[0].price} each {items[0].quantity > 1 && `× ${items[0].quantity}`}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeDiv>
              ) : (
                // Multiple items - compact layout
                items.map((item) => {
                  const specSummary = summarizeSpecifications(item.specifications, 2)
                  return (
                    <FadeDiv key={item.id}>
                      <Card>
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4 sm:space-x-6">
                          <Link
                            href={`/products/${item.id}`}
                            className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0"
                          >
                            <Image
                              src={item.image}
                              alt={item.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 64px, 80px"
                            />
                          </Link>

                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              <Link href={`/products/${item.id}`} className="hover:underline">
                                {item.name}
                              </Link>
                            </h3>
                            {specSummary ? (
                              <p className="text-sm text-gray-600 mt-1">
                                {specSummary}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-600 mt-1">
                                Full specifications available on the product page.
                              </p>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center border border-gray-300 rounded-md">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <MinusIcon className="h-4 w-4" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                                    className="h-8 w-16 text-center border-0 bg-transparent"
                                    min="1"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <PlusIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <TrashIcon className="h-4 w-4" />
                                </Button>
                              </div>
                              
                              <div className="text-right sm:text-right">
                                <div className="text-lg font-semibold text-gray-900">
                                  ${(item.price * item.quantity).toLocaleString()}
                                </div>
                                <div className="text-sm text-gray-500">
                                  ${item.price} each
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    </FadeDiv>
                  )
                })
              )}
            </div>

            {/* Order Summary & Checkout - Dynamic width based on item count */}
            <div className={`space-y-6 ${
              items.length === 1 
                ? 'lg:col-span-8' 
                : items.length <= 3 
                ? 'lg:col-span-6' 
                : 'lg:col-span-5'
            }`}>
              <FadeDiv>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${summarySubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Shipping</span>
                        <span>
                          {summaryShipping !== null
                            ? (summaryShipping === 0 ? "Free" : `$${summaryShipping.toFixed(2)}`)
                            : "Calculated at checkout"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax</span>
                        <span>
                          {showPaymentForm ? (
                          isCalculatingTax ? (
                            <div className="flex items-center text-xs">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse mr-1"></div>
                              Calculating...
                            </div>
                          ) : summaryTax !== null ? (
                            `$${summaryTax.toFixed(2)}`
                          ) : (
                            'Calculated at checkout'
                          )
                        ) : (
                          'Calculated at checkout'
                        )}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>
                        {summaryTotal !== null
                          ? `$${summaryTotal.toFixed(2)}`
                          : 'Calculated at checkout'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </FadeDiv>


              {!showPaymentForm ? (
                <FadeDiv>
                  <Card>
                    <CardContent className="pt-6">
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                        onClick={handleProceedToPayment}
                        disabled={isCheckingOut}
                        data-testid="proceed-to-payment-button"
                      >
                        <CreditCardIcon className="w-5 h-5 mr-2" />
                        {isCheckingOut ? 'Preparing Payment...' : 'Proceed to Payment'}
                      </Button>
                    </CardContent>
                  </Card>
                </FadeDiv>
              ) : (
                <FadeDiv>
                  <CheckoutWrapper
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                </FadeDiv>
              )}
            </div>
          </div>
        </div>
      </FadeContainer>
    </main>
  )
}
