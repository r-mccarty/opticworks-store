"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { useCart } from "@/hooks/useCart"
import { MinusIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = async () => {
    setIsCheckingOut(true)
    // Simulate checkout process
    await new Promise(resolve => setTimeout(resolve, 2000))
    alert('Order placed successfully! (This is a demo)')
    clearCart()
    setIsCheckingOut(false)
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
                Start shopping to add some window tinting products to your cart.
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

  return (
    <main className="relative">
      <FadeContainer className="relative px-6 pt-28 pb-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <FadeDiv>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Shopping Cart
            </h1>
          </FadeDiv>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <FadeDiv key={item.id}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {item.specifications.vlt && `VLT: ${item.specifications.vlt}`}
                            {item.specifications.coverage && ` • Coverage: ${item.specifications.coverage}`}
                          </p>
                          <div className="flex items-center mt-3 space-x-3">
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
                        </div>
                        
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">
                            ${(item.price * item.quantity).toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            ${item.price} each
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeDiv>
              ))}
            </div>

            {/* Order Summary & Checkout */}
            <div className="space-y-6">
              <FadeDiv>
                <Card>
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>${getTotalPrice().toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tax</span>
                      <span>${Math.round(getTotalPrice() * 0.08).toLocaleString()}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${Math.round(getTotalPrice() * 1.08).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              </FadeDiv>

              <FadeDiv>
                <Card>
                  <CardHeader>
                    <CardTitle>Checkout</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your@email.com" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Input id="address" placeholder="123 Main St" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" placeholder="City" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code</Label>
                        <Input id="zip" placeholder="12345" />
                      </div>
                    </div>
                    <Button 
                      className="w-full" 
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                    >
                      {isCheckingOut ? 'Processing...' : 'Place Order'}
                    </Button>
                  </CardContent>
                </Card>
              </FadeDiv>
            </div>
          </div>
        </div>
      </FadeContainer>
    </main>
  )
}