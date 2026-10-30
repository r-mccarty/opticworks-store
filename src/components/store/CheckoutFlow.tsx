"use client"

import { useActionState, useOptimistic, useState, useTransition } from "react"

import { chooseShipping, placeOrder, startCheckout, type CheckoutState } from "@/lib/store/actions"
import type { ContactErrors } from "@/lib/store/bag"
import { formatMoney } from "@/lib/store/money"
import type { CheckoutContact, CheckoutQuote, QuoteLine } from "@/lib/store/types"
import { cx } from "@/lib/utils"
import { inputClass, primaryButton, secondaryButton } from "./styles"

const fields: {
  name: keyof CheckoutContact
  label: string
  autoComplete: string
  type?: string
  optional?: boolean
  span?: string
}[] = [
  {
    name: "email",
    label: "Email",
    autoComplete: "email",
    type: "email",
    span: "sm:col-span-6",
  },
  {
    name: "firstName",
    label: "First name",
    autoComplete: "given-name",
    span: "sm:col-span-3",
  },
  {
    name: "lastName",
    label: "Last name",
    autoComplete: "family-name",
    span: "sm:col-span-3",
  },
  {
    name: "address1",
    label: "Address",
    autoComplete: "address-line1",
    span: "sm:col-span-6",
  },
  {
    name: "address2",
    label: "Apartment, suite, etc.",
    autoComplete: "address-line2",
    optional: true,
    span: "sm:col-span-6",
  },
  {
    name: "city",
    label: "City",
    autoComplete: "address-level2",
    span: "sm:col-span-3",
  },
  {
    name: "state",
    label: "State",
    autoComplete: "address-level1",
    span: "sm:col-span-1",
  },
  {
    name: "postalCode",
    label: "ZIP code",
    autoComplete: "postal-code",
    span: "sm:col-span-2",
  },
  {
    name: "phone",
    label: "Phone",
    autoComplete: "tel",
    type: "tel",
    optional: true,
    span: "sm:col-span-6",
  },
]

export function CheckoutFlow({ lines, currency }: { lines: QuoteLine[]; currency: string }) {
  const [state, submit, submitting] = useActionState<CheckoutState, FormData>(startCheckout, {})
  const [quote, setQuote] = useState<CheckoutQuote>()
  const [editing, setEditing] = useState(true)
  const [error, setError] = useState<string>()
  const [pending, startTransition] = useTransition()
  // Show the chosen shipping method at once; the server's quote confirms it.
  const [shownShipping, showShipping] = useOptimistic(quote?.selectedShippingId)

  // A new quote from the contact step supersedes any earlier one.
  const [lastState, setLastState] = useState(state)
  if (state !== lastState) {
    setLastState(state)
    if (state.quote) {
      setQuote(state.quote)
      setEditing(false)
      setError(undefined)
    }
  }

  const select = (optionId: string) =>
    startTransition(async () => {
      setError(undefined)
      showShipping(optionId)
      const result = await chooseShipping(optionId)
      if (result.quote) setQuote(result.quote)
      if (result.error) setError(result.error)
    })

  const order = () =>
    startTransition(async () => {
      setError(undefined)
      const result = await placeOrder()
      if (result?.error) setError(result.error)
    })

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="space-y-10 lg:col-span-7">
        <section aria-labelledby="contact-title">
          <div className="flex items-baseline justify-between">
            <h2 id="contact-title" className="text-text text-xl">
              1. Contact and shipping address
            </h2>
            {!editing && (
              <button
                type="button"
                className="text-amber hover:text-amber-strong text-sm"
                onClick={() => setEditing(true)}
              >
                Edit
              </button>
            )}
          </div>
          {editing ? (
            <form action={submit} className="mt-6 grid gap-4 sm:grid-cols-6" noValidate>
              {fields.map((field) => (
                <Field key={field.name} {...field} value={state.values?.[field.name]} errors={state.errors} />
              ))}
              <p className="text-text-subtle text-sm sm:col-span-6">We ship within the United States only.</p>
              {state.error && (
                <p role="alert" className="text-destructive text-sm sm:col-span-6">
                  {state.error}
                </p>
              )}
              <div className="sm:col-span-6">
                <button type="submit" className={primaryButton} disabled={submitting}>
                  {submitting ? "Calculating…" : "Continue to shipping"}
                </button>
              </div>
            </form>
          ) : (
            <address className="text-text-muted mt-4 text-sm leading-relaxed not-italic">
              {state.values?.firstName} {state.values?.lastName} · {state.values?.email}
              <br />
              {state.values?.address1}
              {state.values?.address2 ? `, ${state.values.address2}` : ""}, {state.values?.city},{" "}
              {state.values?.state?.toUpperCase()} {state.values?.postalCode}
            </address>
          )}
        </section>

        {quote && !editing && (
          <section aria-labelledby="shipping-title" className="border-line border-t pt-10">
            <h2 id="shipping-title" className="text-text text-xl">
              2. Shipping method
            </h2>
            {quote.shippingOptions.length === 0 ? (
              <p className="text-text-muted mt-4 text-sm">No shipping method is available for this address.</p>
            ) : (
              <fieldset className="mt-6 space-y-3" disabled={pending}>
                <legend className="sr-only">Shipping method</legend>
                {quote.shippingOptions.map((option) => (
                  <label
                    key={option.id}
                    className={cx(
                      "flex cursor-pointer items-center justify-between gap-4 rounded-sm border px-4 py-3 transition-colors",
                      shownShipping === option.id ? "border-amber" : "border-line-strong hover:border-text-subtle",
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={shownShipping === option.id}
                        onChange={() => select(option.id)}
                        className="accent-amber"
                      />
                      <span className="text-text">{option.name}</span>
                    </span>
                    <span className="text-text-muted font-mono text-sm">
                      {formatMoney(option.amount, quote.currency)}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
          </section>
        )}

        {quote && !editing && (
          <section aria-labelledby="review-title" className="border-line border-t pt-10">
            <h2 id="review-title" className="text-text text-xl">
              3. Review and place order
            </h2>
            {quote.placeOrderBlocked && <p className="text-text-muted mt-4 text-sm">{quote.placeOrderBlocked}</p>}
            {error && (
              <p role="alert" className="text-destructive mt-4 text-sm">
                {error}
              </p>
            )}
            <button
              type="button"
              className={cx(primaryButton, "mt-6")}
              onClick={order}
              disabled={pending || Boolean(quote.placeOrderBlocked)}
            >
              {pending ? "Working…" : `Place order · ${formatMoney(quote.total, quote.currency)}`}
            </button>
          </section>
        )}
      </div>

      <aside aria-labelledby="summary-title" className="lg:col-span-5">
        <div className="border-line-strong bg-surface rounded-sm border p-6 lg:sticky lg:top-24">
          <h2 id="summary-title" className="annotation">
            Order summary
          </h2>
          <Summary quote={quote} lines={lines} currency={currency} />
          {editing && quote && (
            <button type="button" className={cx(secondaryButton, "mt-6 w-full")} onClick={() => setEditing(false)}>
              Back to shipping
            </button>
          )}
        </div>
      </aside>
    </div>
  )
}

function Field({
  name,
  label,
  autoComplete,
  type = "text",
  optional,
  span,
  value,
  errors,
}: (typeof fields)[number] & { value?: string; errors?: ContactErrors }) {
  const error = errors?.[name]
  return (
    <div className={span}>
      <label htmlFor={name} className="text-text-muted mb-1.5 block text-sm">
        {label}
        {optional && <span className="text-text-subtle"> (optional)</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={value}
        required={!optional}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={inputClass}
      />
      {error && (
        <p id={`${name}-error`} className="text-destructive mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  )
}

function Summary({ quote, lines, currency }: { quote?: CheckoutQuote; lines: QuoteLine[]; currency: string }) {
  const shown = quote?.lines ?? lines
  const cur = quote?.currency ?? currency
  const subtotal = quote?.subtotal ?? lines.reduce((sum, line) => sum + line.total, 0)
  return (
    <>
      <ul className="divide-line border-line mt-4 divide-y border-y">
        {shown.map((line) => (
          <li key={line.handle} className="flex justify-between gap-4 py-3 text-sm">
            <span className="text-text">
              {line.title} <span className="text-text-subtle">× {line.quantity}</span>
            </span>
            <span className="text-text-muted font-mono">{formatMoney(line.total, cur)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 text-sm">
        <Row label="Subtotal" value={formatMoney(subtotal, cur)} />
        <Row
          label="Shipping"
          value={
            quote?.selectedShippingId
              ? formatMoney(quote.shipping, cur)
              : quote
                ? "Choose a method"
                : "Calculated after address"
          }
        />
        <Row label="Tax" value={quote ? formatMoney(quote.tax, cur) : "Calculated after address"} />
        <div className="border-line text-text flex justify-between border-t pt-3 text-base">
          <dt>Total</dt>
          <dd className="font-mono">{formatMoney(quote?.total ?? subtotal, cur)}</dd>
        </div>
      </dl>
    </>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-text-muted flex justify-between">
      <dt>{label}</dt>
      <dd className="font-mono">{value}</dd>
    </div>
  )
}
