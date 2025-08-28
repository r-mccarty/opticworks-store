"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { useCart } from "@/hooks/useCart"
import { MinusIcon, PlusIcon, TrashIcon, CreditCardIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import CheckoutWrapper from "@/components/checkout/CheckoutWrapper"

export function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalPrice, clearCart } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  
  // Customer info state
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: ''
  })
  
  // Shipping address state
  const [shippingAddress, setShippingAddress] = useState({
    line1: '',
    line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'US'
  })

  const handlePaymentSuccess = (paymentIntentId: string) => {
    console.log('Payment successful:', paymentIntentId)
    alert(`Payment successful! Order confirmation will be sent to ${customerInfo.email}`)
    clearCart()
    setShowPaymentForm(false)
    setIsCheckingOut(false)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
    setIsCheckingOut(false)
  }

  const handleProceedToPayment = () => {
    // Validate required fields
    if (!customerInfo.email || !customerInfo.name || !shippingAddress.line1 || 
        !shippingAddress.city || !shippingAddress.state || !shippingAddress.postal_code) {
      alert('Please fill in all required fields')
      return
    }
    
    setIsCheckingOut(true)
    setShowPaymentForm(true)
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
        <div className="mx-auto max-w-7xl">
          <FadeDiv>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">
              Shopping Cart
            </h1>
          </FadeDiv>

          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-3 space-y-4">
              {items.map((item) => (
                <FadeDiv key={item.id}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-6">
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
            <div className="lg:col-span-2 space-y-8">
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
                      <span>Calculated at checkout</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>Calculated at checkout</span>
                    </div>
                  </CardContent>
                </Card>
              </FadeDiv>

              {!showPaymentForm ? (
                <FadeDiv>
                  <Card>
                    <CardHeader>
                      <CardTitle>Customer Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email *</Label>
                          <Input 
                            id="email" 
                            type="email" 
                            placeholder="your@email.com" 
                            value={customerInfo.email}
                            onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name *</Label>
                          <Input 
                            id="name" 
                            placeholder="John Doe" 
                            value={customerInfo.name}
                            onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeDiv>
              ) : null}

              {!showPaymentForm ? (
                <FadeDiv>
                  <Card>
                    <CardHeader>
                      <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="address1">Address *</Label>
                        <Input 
                          id="address1" 
                          placeholder="123 Main St" 
                          value={shippingAddress.line1}
                          onChange={(e) => setShippingAddress({...shippingAddress, line1: e.target.value})}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address2">Address 2 (Optional)</Label>
                        <Input 
                          id="address2" 
                          placeholder="Apt, suite, etc." 
                          value={shippingAddress.line2}
                          onChange={(e) => setShippingAddress({...shippingAddress, line2: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input 
                            id="city" 
                            placeholder="City" 
                            value={shippingAddress.city}
                            onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input 
                            id="state" 
                            placeholder="CA" 
                            value={shippingAddress.state}
                            onChange={(e) => setShippingAddress({...shippingAddress, state: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zip">ZIP Code *</Label>
                        <Input 
                          id="zip" 
                          placeholder="12345" 
                          value={shippingAddress.postal_code}
                          onChange={(e) => setShippingAddress({...shippingAddress, postal_code: e.target.value})}
                          required
                        />
                      </div>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 text-lg shadow-lg hover:shadow-xl transition-all duration-200" 
                        size="lg"
                        onClick={handleProceedToPayment}
                        disabled={isCheckingOut}
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
                    customerInfo={customerInfo}
                    shippingAddress={shippingAddress}
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