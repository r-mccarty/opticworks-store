"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { RiUploadLine, RiDeleteBinLine, RiCheckLine } from "@remixicon/react"
import { Turnstile } from "@marsidev/react-turnstile"
import { Button } from "../ui/button"
import { Label } from "../ui/label"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  category: z.string().min(1, "Please select a category"),
  orderNumber: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  priority: z.enum(["low", "medium", "high"]),
})

type ContactFormData = z.infer<typeof contactFormSchema>

const categories = [
  { value: "installation", label: "Installation Help" },
  { value: "orders", label: "Order & Shipping" },
  { value: "warranty", label: "Warranty Claim" },
  { value: "billing", label: "Payment & Billing" },
  { value: "compatibility", label: "Product Compatibility" },
  { value: "returns", label: "Returns & Refunds" },
  { value: "other", label: "Other" },
]

const priorities = [
  { value: "low", label: "Low - General Question" },
  { value: "medium", label: "Medium - Need Help Soon" },
  { value: "high", label: "High - Urgent Issue" },
]

// Dark theme input component
function DarkInput({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`flex h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
      {...props}
    />
  )
}

// Dark theme textarea component
function DarkTextarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`flex min-h-[140px] w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-colors ${className}`}
      {...props}
    />
  )
}

// Dark theme select component
function DarkSelect({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder: string
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-11 w-full appearance-none rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 transition-colors cursor-pointer"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        backgroundSize: "16px",
        paddingRight: "40px",
      }}
    >
      <option value="" disabled className="bg-background text-muted-foreground">
        {placeholder}
      </option>
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-background text-foreground"
        >
          {option.label}
        </option>
      ))}
    </select>
  )
}

export function ContactForm() {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileSiteKey, setTurnstileSiteKey] = useState<string | null>(() => {
    const inlineSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
    if (typeof inlineSiteKey === "string" && inlineSiteKey.length > 0) return inlineSiteKey
    return null
  })
  const [isTurnstileSiteKeyLoading, setIsTurnstileSiteKeyLoading] = useState<boolean>(
    () => turnstileSiteKey === null
  )

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      category: "",
      orderNumber: "",
      subject: "",
      message: "",
      priority: "medium",
    },
  })

  useEffect(() => {
    if (turnstileSiteKey) return

    const controller = new AbortController()
    let isActive = true

    async function loadTurnstileSiteKey() {
      try {
        if (isActive) setIsTurnstileSiteKeyLoading(true)
        const response = await fetch("/api/turnstile/site-key", {
          signal: controller.signal,
          cache: "no-store",
        })
        if (!response.ok) return
        const data = (await response.json()) as { siteKey: unknown }
        if (!isActive) return
        if (typeof data.siteKey === "string" && data.siteKey.length > 0) {
          setTurnstileSiteKey(data.siteKey)
        }
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Failed to load Turnstile site key:", error)
        }
      } finally {
        if (isActive) setIsTurnstileSiteKeyLoading(false)
      }
    }

    void loadTurnstileSiteKey()

    return () => {
      isActive = false
      controller.abort()
    }
  }, [turnstileSiteKey])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files].slice(0, 5)) // Max 5 files
  }

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)

    try {
      // Send support request via email API
      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: "ryan@mccarty.id", // TODO: Switch to support@optic.works later
          subject: `Support Request: ${data.subject} [${data.category.toUpperCase()}]`,
          template: "support-request",
          turnstileToken,
          data: {
            customerName: data.name,
            customerEmail: data.email,
            customerPhone: data.phone,
            category: data.category,
            orderNumber: data.orderNumber,
            subject: data.subject,
            message: data.message,
            priority: data.priority,
            submittedAt: new Date().toLocaleString(),
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to send support request")
      }

      const result = await response.json()
      console.log("Support request sent:", result)

      if (typeof window !== "undefined" && typeof window.gtag === "function") {
        window.gtag("event", "contact_form_submit", {
          support_category: data.category,
          priority: data.priority,
        })
      }

      // TODO: Handle file attachments in future enhancement
      if (uploadedFiles.length > 0) {
        console.log(
          "Note: File attachments not yet implemented:",
          uploadedFiles.map((f) => f.name)
        )
      }

      setSubmitted(true)
      setTurnstileToken(null)
    } catch (error) {
      console.error("Error submitting form:", error)
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-elevation-1">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-muted mb-5">
          <RiCheckLine className="h-7 w-7 text-secondary" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-3">
          Message sent
        </h3>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          We&apos;ve received your support request and will respond within 2
          hours during business hours.
        </p>
        <Button
          onClick={() => {
            setSubmitted(false)
            form.reset()
            setUploadedFiles([])
            setTurnstileToken(null)
          }}
          className="px-6"
        >
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 sm:p-8 shadow-elevation-1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <DarkInput placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <DarkInput
                      placeholder="you@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Phone Number
                    <span className="text-muted-foreground ml-1">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <DarkInput placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="orderNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Order Number
                    <span className="text-muted-foreground ml-1">(if applicable)</span>
                  </FormLabel>
                  <FormControl>
                    <DarkInput placeholder="#12345" {...field} />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Support Category */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Support Category
                  </FormLabel>
                  <FormControl>
                    <DarkSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={categories}
                      placeholder="Select category"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Priority Level
                  </FormLabel>
                  <FormControl>
                    <DarkSelect
                      value={field.value}
                      onChange={field.onChange}
                      options={priorities}
                      placeholder="Select priority"
                    />
                  </FormControl>
                  <FormMessage className="text-destructive text-xs" />
                </FormItem>
              )}
            />
          </div>

          {/* Subject */}
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Subject
                </FormLabel>
                <FormControl>
                  <DarkInput
                    placeholder="Brief description of your issue"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          {/* Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium text-foreground">
                  Message
                </FormLabel>
                <FormControl>
                  <DarkTextarea
                    placeholder="Please provide detailed information about your question or issue. Include any error messages, steps you’ve tried, and a screenshot or log snippet if possible."
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-destructive text-xs" />
              </FormItem>
            )}
          />

          {/* File Upload */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground block">
              Attachments
              <span className="text-muted-foreground ml-1">(optional, max 5 files)</span>
            </Label>

            <label
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-border rounded-md cursor-pointer bg-muted/60 hover:bg-muted transition-colors"
            >
              <div className="flex flex-col items-center justify-center py-4">
                <RiUploadLine className="w-6 h-6 mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  <span className="text-foreground">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PNG, JPG, MP4 up to 10MB
                </p>
              </div>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                multiple
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
            </label>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2 mt-3">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/60 rounded-md border border-border"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-sm">
                        <p className="font-medium text-foreground">{file.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-muted-foreground hover:text-destructive hover:bg-transparent"
                    >
                      <RiDeleteBinLine className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Turnstile CAPTCHA */}
          <div className="flex justify-center">
            {turnstileSiteKey ? (
              <Turnstile
                siteKey={turnstileSiteKey}
                onSuccess={setTurnstileToken}
                onExpire={() => setTurnstileToken(null)}
                onError={() => setTurnstileToken(null)}
                options={{ theme: "dark" }}
              />
            ) : (
              <div className="w-full rounded-md border border-border bg-muted/60 px-4 py-3 text-center text-sm text-muted-foreground">
                {isTurnstileSiteKeyLoading
                  ? "Loading CAPTCHA..."
                  : "CAPTCHA unavailable. Please refresh the page or contact support directly."}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 text-sm font-medium"
              disabled={isSubmitting || !turnstileSiteKey || !turnstileToken}
            >
              {isSubmitting ? "Sending..." : "Send message"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
