"use client"

import { useState } from "react"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  RiShoppingBag3Line,
  RiSearchLine,
  RiTruckLine,
  RiMapPinLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiInformationLine,
  RiRefreshLine
} from "@remixicon/react"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"
import { fetchOrderStatus, fetchShippingTracking, type Order, type ShippingUpdate } from "@/lib/api/orders"

// Note: Metadata cannot be exported from client components
// This page requires client-side functionality for the order lookup tool

export default function OrdersPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [shippingUpdates, setShippingUpdates] = useState<ShippingUpdate[]>([])
  const [error, setError] = useState<string | null>(null)

  const handleOrderLookup = async () => {
    if (!orderNumber.trim() || !email.trim()) {
      setError('Please enter both order number and email address')
      return
    }

    setLoading(true)
    setError(null)
    setOrder(null)
    setShippingUpdates([])

    try {
      const orderData = await fetchOrderStatus(orderNumber.trim(), email.trim())
      
      if (!orderData) {
        setError('Order not found. Please check your order number and email address.')
        return
      }

      setOrder(orderData)

      // Fetch shipping updates if tracking number exists
      if (orderData.trackingNumber) {
        const tracking = await fetchShippingTracking(orderData.trackingNumber)
        setShippingUpdates(tracking)
      }
    } catch (err) {
      setError('Failed to fetch order information. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'processing': return 'bg-blue-100 text-blue-800'
      case 'shipped': return 'bg-green-100 text-green-800'
      case 'delivered': return 'bg-emerald-100 text-emerald-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-gray-50 pt-20 pb-16">
        <FadeContainer className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <RiShoppingBag3Line className="h-8 w-8 text-green-600" />
              </div>
              <h1 className="font-barlow text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                Order & Shipping Support
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-gray-600">
                Track your order, get shipping updates, and manage your delivery preferences.
              </p>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Order Lookup Tool */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <RiSearchLine className="h-6 w-6 text-green-600" />
                  <div>
                    <CardTitle className="text-2xl">Track Your Order</CardTitle>
                    <CardDescription>
                      Enter your order number and email to get real-time updates
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orderNumber">Order Number</Label>
                    <Input
                      id="orderNumber"
                      placeholder="ORD-2024-001"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleOrderLookup} 
                  disabled={loading}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Looking up order...' : 'Track Order'}
                </Button>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <RiAlertLine className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeDiv>

          {/* Order Details */}
          {order && (
            <FadeDiv>
              <div className="space-y-6">
                {/* Order Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Order {order.orderNumber}</CardTitle>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <CardDescription>
                      Placed on {formatDate(order.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Order Total</h4>
                        <p className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                        <div className="text-sm text-gray-600 mt-1">
                          <div>Subtotal: ${order.subtotal.toFixed(2)}</div>
                          <div>Shipping: ${order.shipping.toFixed(2)}</div>
                          <div>Tax: ${order.tax.toFixed(2)}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Shipping Address</h4>
                        <div className="text-sm text-gray-600">
                          <div>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</div>
                          <div>{order.shippingAddress.address1}</div>
                          {order.shippingAddress.address2 && <div>{order.shippingAddress.address2}</div>}
                          <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Delivery</h4>
                        {order.estimatedDelivery && (
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center gap-2 mb-1">
                              <RiTruckLine className="h-4 w-4" />
                              Estimated: {new Date(order.estimatedDelivery).toLocaleDateString()}
                            </div>
                          </div>
                        )}
                        {order.trackingNumber && (
                          <div className="text-sm">
                            <div className="font-medium">Tracking: {order.trackingNumber}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Order Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Order Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={item.image} 
                            alt={item.productName}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{item.productName}</h4>
                            <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">${(item.price * item.quantity).toFixed(2)}</div>
                            <div className="text-sm text-gray-600">${item.price.toFixed(2)} each</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Updates */}
                {shippingUpdates.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RiTruckLine className="h-5 w-5" />
                        Shipping Updates
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {shippingUpdates.map((update, index) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-3 h-3 bg-green-500 rounded-full mt-2"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium text-gray-900">{update.status}</div>
                                <div className="text-sm text-gray-500">{formatDate(update.date)}</div>
                              </div>
                              <div className="text-sm text-gray-600">{update.location}</div>
                              <div className="text-sm text-gray-600 mt-1">{update.description}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Order Actions */}
                {(order.status === 'pending' || order.status === 'processing') && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Need to Make Changes?</CardTitle>
                      <CardDescription>
                        You can request changes to your order before it ships
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button variant="outline" className="flex-1">
                          <RiMapPinLine className="mr-2 h-4 w-4" />
                          Change Address
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <RiRefreshLine className="mr-2 h-4 w-4" />
                          Modify Items
                        </Button>
                        <Button variant="outline" className="flex-1 text-red-600 border-red-300 hover:bg-red-50">
                          Cancel Order
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </FadeDiv>
          )}
        </FadeContainer>
      </section>

      {/* Shipping Information */}
      <section className="py-16 bg-white">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="font-barlow text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Shipping Information
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                Everything you need to know about our shipping process
              </p>
            </div>
          </FadeDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                    <RiTruckLine className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Fast Shipping</h3>
                  <p className="text-gray-600 mb-4">
                    Most orders ship within 1-2 business days with tracking provided
                  </p>
                  <div className="text-sm text-gray-500">
                    <div>Standard: 5-7 days</div>
                    <div>Expedited: 2-3 days</div>
                    <div>Overnight: 1 day</div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                    <RiCheckboxCircleLine className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Shipping</h3>
                  <p className="text-gray-600 mb-4">
                    Free standard shipping on all orders over $100
                  </p>
                  <div className="text-sm text-gray-500">
                    No minimum for expedited shipping
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                    <RiInformationLine className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Order Processing</h3>
                  <p className="text-gray-600 mb-4">
                    Orders placed before 2 PM EST ship same day (business days)
                  </p>
                  <div className="text-sm text-gray-500">
                    Custom orders may take 3-5 days
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Contact Support */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Need More Help?
                </h3>
                <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                  Can&apos;t find your order or need assistance? Our support team is here to help.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
                    <Link href={siteConfig.baseLinks.supportContact + "?category=orders"}>
                      Contact Order Support
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href={siteConfig.baseLinks.supportFaq}>
                      View FAQ
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </FadeDiv>
        </FadeContainer>
      </section>
    </main>
  )
}