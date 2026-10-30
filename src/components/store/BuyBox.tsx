"use client"

import Link from "next/link"
import { useEffect, useState, useTransition } from "react"

import { addItem, getOfferForHandle } from "@/lib/store/actions"
import { formatMoney } from "@/lib/store/money"
import { StoreNotice } from "./StoreNotice"
import { primaryButton, secondaryButton } from "./styles"

export const BAG_EVENT = "ow:bag-changed"

type OfferState = Awaited<ReturnType<typeof getOfferForHandle>>

/**
 * Price and add-to-bag for a product page. Loads through a server action so the
 * product page itself stays static; renders nothing while the store is off.
 */
export function BuyBox({ handle }: { handle: string }) {
  const [state, setState] = useState<OfferState>(null)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()

  useEffect(() => {
    let active = true
    getOfferForHandle(handle).then((result) => active && setState(result))
    return () => {
      active = false
    }
  }, [handle])

  if (!state) return null
  const { offer, mode, inBag } = state

  const add = () =>
    startTransition(async () => {
      setError(undefined)
      const result = await addItem(handle)
      if ("error" in result) return setError(result.error)
      setState({ ...state, inBag: inBag + 1 })
      window.dispatchEvent(new CustomEvent(BAG_EVENT, { detail: result.count }))
    })

  return (
    <div className="border-line-strong bg-surface mt-6 rounded-sm border p-5">
      <p className="annotation">Price</p>
      <p className="text-text mt-2 text-3xl font-light tracking-tight">{formatMoney(offer.price, offer.currency)}</p>
      <p className="text-text-subtle mt-1 text-sm">
        Provisional list price, subject to change. Taxes and shipping at checkout.
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <button type="button" className={primaryButton} onClick={add} disabled={pending}>
          {pending ? "Adding…" : "Add to bag"}
        </button>
        {inBag > 0 && (
          <Link href="/cart" className={secondaryButton}>
            View bag ({inBag})
          </Link>
        )}
      </div>
      {error && (
        <p role="alert" className="text-destructive mt-3 text-sm">
          {error}
        </p>
      )}
      <StoreNotice mode={mode} className="mt-5" />
    </div>
  )
}
