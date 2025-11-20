'use client'

/**
 * Theme Toggle Component
 * Allows switching between the three themes: Default, Brutalist, Elegant
 */

import * as React from 'react'
import { useTheme } from '@/hooks/useTheme'
import { getTheme, applyTheme, type ThemeName } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import { Palette } from 'lucide-react'

export function ThemeToggle() {
  const { currentTheme, setTheme } = useTheme()

  const themes: ThemeName[] = ['default', 'brutalist', 'elegant']

  React.useEffect(() => {
    // Apply theme on mount and when changed
    const themeData = getTheme(currentTheme)
    if (typeof window !== 'undefined') {
      applyTheme(themeData)
    }
  }, [currentTheme])

  return (
    <div className="flex items-center gap-2">
      <Palette className="size-4 text-muted-foreground" />
      <div className="flex gap-1">
        {themes.map((themeName) => {
          const t = getTheme(themeName)
          const isActive = currentTheme === themeName

          return (
            <Button
              key={themeName}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTheme(themeName)}
              className="text-xs"
            >
              {t.displayName}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Theme Demo Component
 * Comprehensive visual demonstration of theme styles
 */
export function ThemeDemo() {
  const { currentTheme } = useTheme()
  const theme = getTheme(currentTheme)

  return (
    <div className="space-y-8 p-8 bg-background text-foreground">
      {/* Theme Info */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold" style={{ fontFamily: theme.fonts.heading }}>
          {theme.displayName} Theme
        </h1>
        <p className="text-muted-foreground" style={{ fontFamily: theme.fonts.body }}>
          {theme.description}
        </p>
      </div>

      {/* Color Palette */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="h-20 rounded-theme bg-primary" />
            <p className="text-sm font-medium">Primary</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-theme bg-secondary" />
            <p className="text-sm font-medium">Secondary</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-theme bg-accent" />
            <p className="text-sm font-medium">Accent</p>
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-theme bg-destructive" />
            <p className="text-sm font-medium">Destructive</p>
          </div>
        </div>
      </div>

      {/* Border Styles */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Border Style</h2>
        <div className="flex gap-4 items-center">
          <div className="space-y-2">
            <div className="size-20 rounded-theme border-2 border-border bg-card" />
            <p className="text-sm">
              <span className="font-medium">Style:</span> {theme.borders.style}
            </p>
            <p className="text-sm">
              <span className="font-medium">Radius:</span> {theme.borders.radius}
            </p>
          </div>
        </div>
      </div>

      {/* Typography */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Typography</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Heading Font</p>
            <h3 className="text-2xl font-bold" style={{ fontFamily: theme.fonts.heading }}>
              The quick brown fox jumps
            </h3>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Body Font</p>
            <p className="text-base" style={{ fontFamily: theme.fonts.body }}>
              The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Display Font</p>
            <h2 className="text-3xl font-bold" style={{ fontFamily: theme.fonts.display }}>
              PRESENCE SENSOR
            </h2>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Mono Font</p>
            <code className="text-sm font-mono bg-muted px-2 py-1 rounded-theme">
              npm install @opticworks/sensor
            </code>
          </div>
        </div>
      </div>

      {/* Component Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Components</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="default">Primary Button</Button>
          <Button variant="secondary">Secondary Button</Button>
          <Button variant="outline">Outline Button</Button>
          <Button variant="destructive">Destructive Button</Button>
          <Button variant="ghost">Ghost Button</Button>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-theme border bg-card text-card-foreground p-6 space-y-2">
            <h3 className="font-semibold">Card Title</h3>
            <p className="text-sm text-muted-foreground">
              This is a card component with theme-aware styling.
            </p>
          </div>
          <div className="rounded-theme border bg-card text-card-foreground p-6 space-y-2">
            <h3 className="font-semibold">Another Card</h3>
            <p className="text-sm text-muted-foreground">
              Border radius adapts to the selected theme.
            </p>
          </div>
          <div className="rounded-theme border bg-card text-card-foreground p-6 space-y-2">
            <h3 className="font-semibold">Third Card</h3>
            <p className="text-sm text-muted-foreground">
              Colors and fonts all follow the theme system.
            </p>
          </div>
        </div>
      </div>

      {/* Input Examples */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Form Elements</h2>
        <div className="space-y-3 max-w-md">
          <input
            type="text"
            placeholder="Text input"
            className="flex h-9 w-full rounded-theme border border-input bg-background px-3 py-1 text-base shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <textarea
            placeholder="Textarea"
            rows={3}
            className="flex min-h-[60px] w-full rounded-theme border border-input bg-background px-3 py-2 text-base shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>
    </div>
  )
}
