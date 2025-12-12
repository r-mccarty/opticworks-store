"use client"

import { useState } from "react"
import { FadeContainer, FadeDiv } from "@/components/Fade"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  RiBankCardLine,
  RiSearchLine,
  RiDownloadLine,
  RiRefund2Line,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiFileTextLine,
  RiCustomerService2Line
} from "@remixicon/react"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"
import { fetchInvoice, generateInvoicePDF, requestRefund, retryPayment, type Invoice, type RefundRequest } from "@/lib/api/billing"

export default function BillingPage() {
  const [lookupType, setLookupType] = useState<'order' | 'invoice'>('order')
  const [identifier, setIdentifier] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Refund request state
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState<RefundRequest['reason']>('defective_product')
  const [refundDetails, setRefundDetails] = useState('')
  const [refundLoading, setRefundLoading] = useState(false)

  const handleInvoiceLookup = async () => {
    if (!identifier.trim() || !email.trim()) {
      setError('Please enter both identifier and email address')
      return
    }

    setLoading(true)
    setError(null)
    setInvoice(null)

    try {
      const invoiceData = await fetchInvoice(identifier.trim(), email.trim())
      
      if (!invoiceData) {
        setError(`${lookupType === 'order' ? 'Order' : 'Invoice'} not found. Please check your information.`)
        return
      }

      setInvoice(invoiceData)
    } catch (error) {
      setError('Failed to fetch billing information. Please try again.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!invoice) return

    try {
      const result = await generateInvoicePDF(invoice.invoiceNumber, invoice.customerEmail)
      if (result.success && result.downloadUrl) {
        window.open(result.downloadUrl, '_blank')
      } else {
        alert(result.error || 'Failed to generate invoice PDF')
      }
    } catch (error) {
      alert('Failed to download invoice. Please try again.')
      console.error(error)
    }
  }

  const handleRefundRequest = async () => {
    if (!invoice || !refundAmount || !refundDetails.trim()) {
      setError('Please fill in all refund request fields')
      return
    }

    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid refund amount')
      return
    }

    if (amount > (invoice.paidAmount - invoice.refundedAmount)) {
      setError(`Refund amount cannot exceed ${(invoice.paidAmount - invoice.refundedAmount).toFixed(2)}`)
      return
    }

    setRefundLoading(true)
    setError(null)

    try {
      const result = await requestRefund(invoice.orderNumber, invoice.customerEmail, {
        amount,
        reason: refundReason,
        reasonDetails: refundDetails,
        refundMethod: 'original_payment'
      })

      if (result.success) {
        alert(`Refund request submitted successfully! Reference ID: ${result.requestId}`)
        // Reset form
        setRefundAmount('')
        setRefundDetails('')
      } else {
        setError(result.error || 'Failed to submit refund request')
      }
    } catch (error) {
      setError('Failed to submit refund request. Please try again.')
      console.error(error)
    } finally {
      setRefundLoading(false)
    }
  }

  const handleRetryPayment = async () => {
    if (!invoice) return

    try {
      const result = await retryPayment(invoice.orderNumber, invoice.customerEmail)
      if (result.success) {
        alert('Payment processed successfully!')
        // Refresh invoice data
        handleInvoiceLookup()
      } else {
        alert(result.error || 'Payment failed. Please try again.')
      }
    } catch (error) {
      alert('Failed to process payment. Please try again.')
      console.error(error)
    }
  }

  const getStatusVariant = (status: Invoice["status"]) => {
    switch (status) {
      case "paid":
        return "default"
      case "pending":
        return "secondary"
      case "overdue":
        return "destructive"
      case "refunded":
        return "outline"
      case "cancelled":
        return "outline"
      default:
        return "outline"
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-background to-muted/40 pt-24 pb-16">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <FadeDiv>
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <RiBankCardLine className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl font-display">
                Billing & Payments
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-8 text-muted-foreground">
                Manage your invoices, process refunds, and resolve billing questions.
              </p>
            </FadeDiv>
          </div>
        </FadeContainer>
      </section>

      {/* Invoice Lookup Tool */}
      <section className="py-16">
        <FadeContainer className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <RiSearchLine className="h-6 w-6 text-primary" />
                  <div>
                    <CardTitle className="text-2xl">Find Your Invoice</CardTitle>
                    <CardDescription>
                      Look up your billing information and manage payments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="lookupType">Search by</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <Button
                      variant={lookupType === 'order' ? 'default' : 'outline'}
                      onClick={() => setLookupType('order')}
                      className="justify-start"
                    >
                      Order Number
                    </Button>
                    <Button
                      variant={lookupType === 'invoice' ? 'default' : 'outline'}
                      onClick={() => setLookupType('invoice')}
                      className="justify-start"
                    >
                      Invoice Number
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="identifier">
                      {lookupType === 'order' ? 'Order Number' : 'Invoice Number'}
                    </Label>
                    <Input
                      id="identifier"
                      placeholder={lookupType === 'order' ? 'ORD-2024-001' : 'INV-2024-001'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
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
                  onClick={handleInvoiceLookup} 
                  disabled={loading}
                  className="w-full sm:w-auto"
                >
                  {loading ? 'Searching...' : 'Find Invoice'}
                </Button>

                {error && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <div className="flex items-start gap-3">
                      <RiAlertLine className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                      <p className="text-sm text-foreground">{error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </FadeDiv>

          {/* Invoice Details */}
          {invoice && (
            <FadeDiv>
              <div className="space-y-6">
                {/* Invoice Summary */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">Invoice {invoice.invoiceNumber}</CardTitle>
                        <CardDescription>Order {invoice.orderNumber}</CardDescription>
                      </div>
                      <Badge variant={getStatusVariant(invoice.status)} className="capitalize">
                        {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <h4 className="mb-2 font-medium text-foreground">Amount due</h4>
                        <p className="text-2xl font-semibold text-primary">
                          ${(invoice.total - invoice.paidAmount).toFixed(2)}
                        </p>
                        <div className="mt-1 text-sm text-muted-foreground">
                          <div>Total: ${invoice.total.toFixed(2)}</div>
                          <div>Paid: ${invoice.paidAmount.toFixed(2)}</div>
                          {invoice.refundedAmount > 0 && (
                            <div>Refunded: ${invoice.refundedAmount.toFixed(2)}</div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="mb-2 font-medium text-foreground">Payment method</h4>
                        <div className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <RiBankCardLine className="h-4 w-4" />
                            {invoice.paymentMethod.brand} ending in {invoice.paymentMethod.last4}
                          </div>
                          {invoice.paymentMethod.expiryMonth && invoice.paymentMethod.expiryYear && (
                            <div className="mt-1">
                              Expires: {invoice.paymentMethod.expiryMonth.toString().padStart(2, '0')}/{invoice.paymentMethod.expiryYear}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="mb-2 font-medium text-foreground">Dates</h4>
                        <div className="text-sm text-muted-foreground">
                          <div>Created: {formatDate(invoice.createdAt)}</div>
                          <div>Due: {formatDate(invoice.dueDate)}</div>
                          {invoice.paidAt && (
                            <div>Paid: {formatDate(invoice.paidAt)}</div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-4">
                      <Button
                        onClick={handleDownloadInvoice}
                        variant="outline"
                        className="flex-1 sm:flex-none"
                      >
                        <RiDownloadLine className="mr-2 h-4 w-4" />
                        Download PDF
                      </Button>
                      
                      {invoice.status === 'pending' && (
                        <Button
                          onClick={handleRetryPayment}
                          className="flex-1 sm:flex-none"
                        >
                          Retry Payment
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Billing Address */}
                <Card>
                  <CardHeader>
                    <CardTitle>Billing Address</CardTitle>
                  </CardHeader>
                <CardContent>
                    <div className="text-sm text-muted-foreground">
                      <div>{invoice.billingAddress.firstName} {invoice.billingAddress.lastName}</div>
                      {invoice.billingAddress.company && <div>{invoice.billingAddress.company}</div>}
                      <div>{invoice.billingAddress.address1}</div>
                      {invoice.billingAddress.address2 && <div>{invoice.billingAddress.address2}</div>}
                      <div>{invoice.billingAddress.city}, {invoice.billingAddress.state} {invoice.billingAddress.zipCode}</div>
                      <div>{invoice.billingAddress.country}</div>
                    </div>
                  </CardContent>
                </Card>

                {/* Refund Request */}
                {(invoice.status === 'paid' && invoice.paidAmount > invoice.refundedAmount) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <RiRefund2Line className="h-5 w-5" />
                        Request Refund
                      </CardTitle>
                      <CardDescription>
                        Available for refund: ${(invoice.paidAmount - invoice.refundedAmount).toFixed(2)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="refundAmount">Refund Amount</Label>
                          <Input
                            id="refundAmount"
                            type="number"
                            step="0.01"
                            max={invoice.paidAmount - invoice.refundedAmount}
                            placeholder="0.00"
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="refundReason">Reason</Label>
                          <Select value={refundReason} onValueChange={(value) => setRefundReason(value as RefundRequest['reason'])}>
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="defective_product">Defective Product</SelectItem>
                              <SelectItem value="wrong_item">Wrong Item Received</SelectItem>
                              <SelectItem value="not_as_described">Not As Described</SelectItem>
                              <SelectItem value="duplicate_charge">Duplicate Charge</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="refundDetails">Details</Label>
                        <Textarea
                          id="refundDetails"
                          placeholder="Please explain the reason for your refund request..."
                          value={refundDetails}
                          onChange={(e) => setRefundDetails(e.target.value)}
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleRefundRequest}
                        disabled={refundLoading}
                        className="w-full sm:w-auto"
                      >
                        {refundLoading ? 'Submitting...' : 'Request Refund'}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </FadeDiv>
          )}
        </FadeContainer>
      </section>

      {/* Payment Information */}
      <section className="py-16 bg-background">
        <FadeContainer className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <FadeDiv>
            <div className="text-center mb-12">
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl font-display">
                Payment Information
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to know about billing and payments
              </p>
            </div>
          </FadeDiv>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <RiCheckboxCircleLine className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">Secure payments</h3>
                  <p className="mb-4 text-muted-foreground">
                    All payments are processed securely through Stripe with bank-level encryption
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <div>Visa, Mastercard, American Express</div>
                    <div>PayPal, Apple Pay, Google Pay</div>
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <RiRefund2Line className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">Easy refunds</h3>
                  <p className="mb-4 text-muted-foreground">
                    30-day refund policy with easy online refund requests
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Most refunds processed within 3-5 business days
                  </div>
                </CardContent>
              </Card>
            </FadeDiv>

            <FadeDiv>
              <Card className="text-center h-full">
                <CardContent className="p-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <RiFileTextLine className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-foreground">Digital invoices</h3>
                  <p className="mb-4 text-muted-foreground">
                    Instant invoice generation with PDF download capability
                  </p>
                  <div className="text-sm text-muted-foreground">
                    Email receipts sent automatically
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
            <Card className="border-border bg-muted/30">
              <CardContent className="p-8 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <RiCustomerService2Line className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mb-4 text-2xl font-semibold text-foreground">
                  Need Billing Assistance?
                </h3>
                <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
                  Our billing specialists are here to help resolve any payment issues or answer questions.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg">
                    <Link href={siteConfig.baseLinks.supportContact + "?category=billing"}>
                      Contact Billing Support
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href={siteConfig.baseLinks.supportFaq}>
                      Billing FAQ
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
