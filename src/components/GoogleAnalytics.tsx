'use client'

import Script from 'next/script'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect, Suspense } from 'react'

declare global {
  interface Window {
    dataLayer: Record<string, unknown>[]
    gtag: (command: string, targetId: string, config?: Record<string, unknown>) => void
  }
}

interface GoogleAnalyticsProps {
  measurementId: string
}

// Component that tracks page views (uses useSearchParams)
function PageViewTracker({ measurementId }: { measurementId: string }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Track page views on route changes
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
      
      // Check if debug mode is enabled
      const isDebugMode = searchParams.has('debug_mode') || process.env.NODE_ENV === 'development'
      
      window.gtag('config', measurementId, {
        page_path: url,
        debug_mode: isDebugMode,
        send_page_view: true
      })
      
      // Send a page_view event
      window.gtag('event', 'page_view', {
        page_path: url,
        debug_mode: isDebugMode
      })
      
      console.log(`GA4: Page view tracked for ${url}${isDebugMode ? ' (DEBUG MODE)' : ''}`)
      
      if (isDebugMode) {
        console.log('GA4 Debug Mode: Visit https://analytics.google.com/analytics/web/#/p12118393170/reports/explorer?params=_u..debug-view to see real-time debug data')
      }
    }
  }, [pathname, searchParams, measurementId])

  return null
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
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
          
          // Configuration with environment-specific settings
          gtag('config', '${measurementId}', {
            send_page_view: true,
            debug_mode: ${isDevelopment},
            anonymize_ip: true,
            cookie_flags: 'secure;samesite=strict'
          });
          
          console.log('GA4: Initialized with measurement ID ${measurementId}');
          console.log('GA4: Environment: ${isDevelopment ? 'Development' : 'Production'}');
          console.log('GA4: Debug mode: ${isDevelopment ? 'Enabled' : 'Disabled'}');
          
          // Enhanced debugging for development
          if (${isDevelopment}) {
            console.log('GA4: Visit DebugView at https://analytics.google.com/analytics/web/#/p12118393170/reports/explorer?params=_u..debug-view');
            console.log('GA4: Current domain:', window.location.hostname);
            console.log('GA4: DataLayer initialized:', window.dataLayer);
          }
          
          // Test event to verify connection
          gtag('event', 'ga4_initialization', {
            event_category: 'debug',
            event_label: '${measurementId}',
            custom_parameter_environment: '${isDevelopment ? 'development' : 'production'}',
            custom_parameter_hostname: window.location.hostname
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <PageViewTracker measurementId={measurementId} />
      </Suspense>
    </>
  )
}