'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void
  }
}

interface GoogleAnalyticsProps {
  measurementId: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Track page views on route changes
      const url = pathname + searchParams.toString()
      window.gtag('config', measurementId, {
        page_path: url,
      })
      
      // Send a page_view event
      window.gtag('event', 'page_view', {
        page_path: url,
      })
      
      console.log(`GA4: Page view tracked for ${url}`)
    }
  }, [pathname, searchParams, measurementId])

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            send_page_view: true
          });
          
          console.log('GA4: Initialized with measurement ID ${measurementId}');
        `}
      </Script>
    </>
  )
}