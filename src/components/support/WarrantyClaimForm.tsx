"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { RiUploadLine, RiDeleteBinLine, RiCameraLine } from "@remixicon/react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const warrantyFormSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  orderNumber: z.string().min(1, "Order number is required"),
  purchaseDate: z.string().min(1, "Purchase date is required"),
  vehicleYear: z.string().min(4, "Vehicle year is required"),
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  issueType: z.string().min(1, "Please select an issue type"),
  issueDescription: z.string().min(20, "Please provide a detailed description"),
  installationDate: z.string().optional(),
  installedByProfessional: z.enum(["yes", "no", "unsure"]),
})

type WarrantyFormData = z.infer<typeof warrantyFormSchema>

const issueTypes = [
  { value: "bubbling", label: "Bubbling" },
  { value: "peeling", label: "Peeling" },
  { value: "fading", label: "Fading" },
  { value: "cracking", label: "Cracking" },
  { value: "discoloration", label: "Discoloration" },
  { value: "adhesive_failure", label: "Adhesive Failure" },
  { value: "manufacturing_defect", label: "Manufacturing Defect" },
  { value: "other", label: "Other" },
]

export function WarrantyClaimForm() {
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<WarrantyFormData>({
    resolver: zodResolver(warrantyFormSchema),
  })

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedPhotos(prev => [...prev, ...files].slice(0, 10)) // Max 10 photos
  }

  const removePhoto = (index: number) => {
    setUploadedPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const onSubmit = async (data: WarrantyFormData) => {
    setIsSubmitting(true)
    
    try {
      // Here you would typically send the form data to your backend
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log("Warranty claim submitted:", data)
      console.log("Uploaded photos:", uploadedPhotos)
      
      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting warranty claim:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
          <svg className="h-6 w-6 text-orange-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Warranty Claim Submitted!
        </h3>
        <p className="text-gray-600 mb-4">
          We&apos;ve received your warranty claim and will review it within 24 hours.
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-orange-800">
            <strong>Claim Reference:</strong> WC-{Date.now().toString().slice(-8)}
          </p>
          <p className="text-sm text-orange-600 mt-1">
            Save this reference number for your records
          </p>
        </div>
        <Button onClick={() => {setSubmitted(false); form.reset(); setUploadedPhotos([])}}>
          Submit Another Claim
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Warranty Claim Form</h2>
        <p className="text-sm text-gray-600">
          Please provide detailed information about the issue. Photos are required for processing your claim.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Contact Information</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Purchase Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Purchase Information</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="orderNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="#12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="purchaseDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purchase Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Vehicle Information</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="vehicleYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year *</FormLabel>
                    <FormControl>
                      <Input placeholder="2023" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleMake"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Make *</FormLabel>
                    <FormControl>
                      <Input placeholder="Tesla" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vehicleModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model *</FormLabel>
                    <FormControl>
                      <Input placeholder="Model Y" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Issue Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Issue Details</h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="issueType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select issue type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {issueTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="installationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Installation Date (If Known)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="installedByProfessional"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Was the tint installed by a professional? *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="yes">Yes, professionally installed</SelectItem>
                      <SelectItem value="no">No, I installed it myself</SelectItem>
                      <SelectItem value="unsure">I&apos;m not sure</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="issueDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detailed Issue Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe the issue in detail. When did you first notice it? Has it gotten worse over time? What conditions led to the problem?"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Photo Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Photo Evidence</h3>
            <p className="text-sm text-gray-600">
              <RiCameraLine className="inline w-4 h-4 mr-1" />
              Please upload clear photos showing the issue. Multiple angles are helpful.
            </p>
            
            <div className="flex items-center justify-center w-full">
              <label 
                htmlFor="photo-upload" 
                className="flex flex-col items-center justify-center w-full h-40 border-2 border-orange-300 border-dashed rounded-lg cursor-pointer bg-orange-50 hover:bg-orange-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <RiUploadLine className="w-10 h-10 mb-3 text-orange-500" />
                  <p className="mb-2 text-sm text-orange-700">
                    <span className="font-semibold">Click to upload photos</span> or drag and drop
                  </p>
                  <p className="text-xs text-orange-600">PNG, JPG up to 10MB each (max 10 photos)</p>
                </div>
                <input 
                  id="photo-upload" 
                  type="file" 
                  className="hidden" 
                  multiple 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </label>
            </div>

            {/* Uploaded Photos Grid */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={URL.createObjectURL(photo)} 
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <RiDeleteBinLine className="w-3 h-3" />
                    </button>
                    <p className="mt-1 text-xs text-gray-500 truncate">{photo.name}</p>
                  </div>
                ))}
              </div>
            )}

            {uploadedPhotos.length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-red-600">
                  ⚠️ Photos are required to process warranty claims
                </p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6 border-t">
            <Button 
              type="submit" 
              className="bg-orange-600 hover:bg-orange-700 px-8"
              disabled={isSubmitting || uploadedPhotos.length === 0}
            >
              {isSubmitting ? "Submitting Claim..." : "Submit Warranty Claim"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}