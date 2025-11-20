/**
 * Theme Demo Page
 * Visual demonstration of the three theme variants
 * Access at: /theme-demo
 */

import { ThemeToggle, ThemeDemo } from '@/components/ui/theme-toggle'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Theme Demo - OpticWorks',
  description: 'Visual demonstration of theme system with Default, Brutalist, and Elegant variants',
}

export default function ThemeDemoPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header with theme switcher */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Theme System Demo</h1>
              <p className="text-sm text-muted-foreground">
                Toggle between Default, Brutalist, and Elegant themes
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Theme demonstration */}
      <div className="container mx-auto">
        <ThemeDemo />
      </div>

      {/* Theme specifications */}
      <div className="container mx-auto px-8 py-8 space-y-8">
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Theme Specifications</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Default Theme */}
            <div className="rounded-theme border bg-card p-6 space-y-4">
              <h3 className="text-xl font-bold">Default (OpticWorks)</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Color:</span> Warm Orange (#FF7700)
                </div>
                <div>
                  <span className="font-semibold">Border:</span> Medium Rounded (0.5rem/8px)
                </div>
                <div>
                  <span className="font-semibold">Heading:</span> Colfax
                </div>
                <div>
                  <span className="font-semibold">Body:</span> Colfax
                </div>
                <div>
                  <span className="font-semibold">Display:</span> Feature
                </div>
                <div className="pt-2 text-muted-foreground">
                  Modern, approachable design with balanced rounded corners for a friendly, professional feel.
                </div>
              </div>
            </div>

            {/* Brutalist Theme */}
            <div className="rounded-theme border bg-card p-6 space-y-4">
              <h3 className="text-xl font-bold">Brutalist</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Color:</span> Cyan Blue (#0095E6)
                </div>
                <div>
                  <span className="font-semibold">Border:</span> Square (0px)
                </div>
                <div>
                  <span className="font-semibold">Heading:</span> Barlow
                </div>
                <div>
                  <span className="font-semibold">Body:</span> Barlow
                </div>
                <div>
                  <span className="font-semibold">Display:</span> Feature Condensed
                </div>
                <div className="pt-2 text-muted-foreground">
                  Bold, high-contrast design with sharp edges and no rounded corners for a raw, utilitarian aesthetic.
                </div>
              </div>
            </div>

            {/* Elegant Theme */}
            <div className="rounded-theme border bg-card p-6 space-y-4">
              <h3 className="text-xl font-bold">Elegant</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-semibold">Color:</span> Purple (#9D5CDE)
                </div>
                <div>
                  <span className="font-semibold">Border:</span> Large Rounded (1rem/16px)
                </div>
                <div>
                  <span className="font-semibold">Heading:</span> Feature
                </div>
                <div>
                  <span className="font-semibold">Body:</span> Colfax
                </div>
                <div>
                  <span className="font-semibold">Display:</span> Feature
                </div>
                <div className="pt-2 text-muted-foreground">
                  Refined, luxurious design with smooth, flowing curves and a sophisticated purple palette.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* tweakcn Instructions */}
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-4">Using with tweakcn</h2>
          <div className="rounded-theme border bg-muted/50 p-6 space-y-4">
            <p className="text-sm">
              This theme system is fully compatible with tweakcn. All theme values are defined as CSS variables
              that can be modified dynamically.
            </p>
            <div className="space-y-2">
              <h4 className="font-semibold">Key CSS Variables:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
                <li><code>--primary</code>, <code>--secondary</code>, <code>--accent</code> - Color palette (HSL format)</li>
                <li><code>--radius</code> - Border radius (0px for square, 0.5rem for rounded, 1rem for pill)</li>
                <li><code>--font-heading</code>, <code>--font-body</code>, <code>--font-display</code> - Typography</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Files to Modify:</h4>
              <ul className="text-sm space-y-1 font-mono text-muted-foreground">
                <li>📄 src/app/globals.css - CSS variable definitions</li>
                <li>📄 src/lib/themes.ts - Theme configurations</li>
                <li>📄 src/hooks/useTheme.ts - Theme state management</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
