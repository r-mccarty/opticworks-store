"use client"

import React, { forwardRef, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: string | HTMLElement,
        options: {
          sitekey: string
          callback: (token: string) => void
          "expired-callback"?: () => void
          "error-callback"?: () => void
        }
      ) => string
      reset: (widgetId?: string) => void
      remove?: (widgetId?: string) => void
    }
  }
}

const TURNSTILE_SCRIPT_ID = "cf-turnstile-script"
let turnstileScriptPromise: Promise<void> | null = null

function loadTurnstileScript() {
  if (typeof window === "undefined") {
    return Promise.resolve()
  }

  if (window.turnstile) {
    return Promise.resolve()
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise
  }

  turnstileScriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID)

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Failed to load Turnstile script")), { once: true })
      return
    }

    const script = document.createElement("script")
    script.id = TURNSTILE_SCRIPT_ID
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Turnstile script"))
    document.body.appendChild(script)
  })

  return turnstileScriptPromise
}

export interface TurnstileWidgetProps {
  siteKey: string
  onVerify: (token: string) => void
  onExpire?: () => void
  onFailure?: (message: string) => void
  className?: string
}

export const TurnstileWidget = forwardRef<HTMLDivElement, TurnstileWidgetProps>(
  ({ siteKey, onVerify, onExpire, onFailure, className }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const widgetIdRef = useRef<string | null>(null)
    const verifyRef = useRef(onVerify)
    const expireRef = useRef(onExpire)
    const failureRef = useRef(onFailure)

    useEffect(() => {
      verifyRef.current = onVerify
    }, [onVerify])

    useEffect(() => {
      expireRef.current = onExpire
    }, [onExpire])

    useEffect(() => {
      failureRef.current = onFailure
    }, [onFailure])

    useEffect(() => {
      let isMounted = true

      if (!siteKey) {
        return
      }

      void loadTurnstileScript()
        .then(() => {
          if (!isMounted || !containerRef.current || !window.turnstile) {
            return
          }

          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: token => {
              if (!isMounted) {
                return
              }
              verifyRef.current?.(token)
            },
            "expired-callback": () => {
              if (!isMounted) {
                return
              }
              expireRef.current?.()
              if (widgetIdRef.current) {
                window.turnstile?.reset(widgetIdRef.current)
              }
            },
            "error-callback": () => {
              if (!isMounted) {
                return
              }
              failureRef.current?.("Security check failed to load. Please refresh and try again.")
            },
          })
        })
        .catch(error => {
          console.error("Turnstile script failed to load", error)
          failureRef.current?.("Security check failed to load. Please refresh and try again.")
        })

      return () => {
        isMounted = false

        if (widgetIdRef.current && window.turnstile?.remove) {
          window.turnstile.remove(widgetIdRef.current)
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = ""
        }
      }
    }, [siteKey])

    return (
      <div
        ref={node => {
          containerRef.current = node
          if (typeof ref === "function") {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
        }}
        className={cn("min-h-[70px]", className)}
      />
    )
  }
)

TurnstileWidget.displayName = "TurnstileWidget"
