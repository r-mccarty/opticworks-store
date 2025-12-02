"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

export default function AccountPage() {
  const router = useRouter()
  const { customer, isAuthenticated, isLoading, logout, fetchCustomer } = useAuth()

  // Fetch customer data on mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomer()
    }
  }, [isAuthenticated, fetchCustomer])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth/login?redirect=/account")
    }
  }, [isAuthenticated, isLoading, router])

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  // Show loading state
  if (isLoading || !isAuthenticated) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-400">Loading...</div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-bold text-white">My Account</h1>
            <p className="text-zinc-400 mt-1">
              Welcome back{customer?.first_name ? `, ${customer.first_name}` : ""}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            Sign Out
          </Button>
        </div>

        {/* Account sections */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* Profile Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Profile</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-zinc-500">Name</span>
                <p className="text-white">
                  {customer?.first_name || customer?.last_name
                    ? `${customer?.first_name || ""} ${customer?.last_name || ""}`.trim()
                    : "Not set"}
                </p>
              </div>
              <div>
                <span className="text-sm text-zinc-500">Email</span>
                <p className="text-white">{customer?.email || "—"}</p>
              </div>
              <div>
                <span className="text-sm text-zinc-500">Phone</span>
                <p className="text-white">{customer?.phone || "Not set"}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="mt-4 text-zinc-400 hover:text-white p-0"
              disabled
            >
              Edit Profile (Coming Soon)
            </Button>
          </div>

          {/* Orders Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Orders</h2>
            <p className="text-zinc-400 mb-4">
              View your order history and track shipments.
            </p>
            <Link href="/account/orders">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                disabled
              >
                View Orders (Coming Soon)
              </Button>
            </Link>
          </div>

          {/* Addresses Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Addresses</h2>
            <p className="text-zinc-400 mb-4">
              Manage your shipping and billing addresses.
            </p>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              disabled
            >
              Manage Addresses (Coming Soon)
            </Button>
          </div>

          {/* Support Card */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Support</h2>
            <p className="text-zinc-400 mb-4">
              Need help? Our team is here to assist you.
            </p>
            <Link href="/support/contact">
              <Button
                variant="outline"
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
