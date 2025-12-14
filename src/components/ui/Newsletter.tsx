"use client"

import { useState } from "react"
import { X } from "lucide-react"

export default function Newsletter() {
  const [isOpen, setIsOpen] = useState(true)

  if (!isOpen) return null

  return (
    <div className="fixed right-6 bottom-6 z-40 w-full max-w-sm animate-in slide-in-from-bottom-10 fade-in duration-700">
      <div className="rounded-xl border-2 border-amber-500 bg-neutral-100 p-1 shadow-2xl">
        <div className="relative rounded-lg bg-white p-6">
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
            aria-label="Close newsletter signup"
          >
            <X size={16} />
          </button>

          <h3 className="mb-1 font-display text-2xl font-medium text-neutral-900">
            Stay in the loop
          </h3>
          <p className="mb-4 text-xs font-bold tracking-wide text-neutral-500 uppercase">
            Get Updates • No Spam
          </p>

          <form
            className="flex flex-col gap-3"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              type="email"
              placeholder="email@address.com"
              className="w-full rounded bg-neutral-100 p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500 outline-none"
            />
            <button
              type="submit"
              className="w-full rounded bg-neutral-900 py-3 font-medium text-white transition-colors hover:bg-neutral-800"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

