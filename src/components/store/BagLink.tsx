"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

import { getBagSummary } from "@/lib/store/actions"
import { cx } from "@/lib/utils"
import { BAG_EVENT } from "./BuyBox"

/** Header link to the bag. Renders nothing while the store is off. */
export function BagLink({ className }: { className?: string }) {
  const pathname = usePathname()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let active = true
    getBagSummary().then((summary) => active && setCount(summary?.count ?? null))
    return () => {
      active = false
    }
  }, [pathname])

  useEffect(() => {
    const onChange = (event: Event) => setCount((event as CustomEvent<number>).detail)
    window.addEventListener(BAG_EVENT, onChange)
    return () => window.removeEventListener(BAG_EVENT, onChange)
  }, [])

  if (count === null) return null
  return (
    <Link
      href="/cart"
      aria-current={pathname === "/cart" ? "page" : undefined}
      className={cx("text-text-muted hover:text-text text-sm transition-colors", className)}
    >
      Bag
      <span className="text-amber ml-1.5 font-mono text-xs" aria-label={`${count} items`}>
        {count}
      </span>
    </Link>
  )
}
