# OpticWorks Design System

A dark-mode-only design system with orange accent, modern rounded aesthetic inspired by xAI/Grok, Daylight Computer Co, Apple, and Oxide Computer.

## Quick Start

All design tokens are defined as CSS custom properties in `src/app/globals.css` and mapped to Tailwind utilities in `tailwind.config.ts`.

```tsx
// Using semantic colors
<div className="bg-background text-foreground">
  <h1 className="text-foreground">Title</h1>
  <p className="text-foreground-muted">Subtitle</p>
  <Button variant="default">Primary Action</Button>
</div>
```

## Design Principles

1. **Dark Mode Only** - Single theme, no light mode
2. **Orange Accent** - Primary accent is orange (#f97316)
3. **Modern Rounded** - Large border radius (rounded-xl, rounded-2xl)
4. **Semantic Tokens** - Colors named by purpose, not value
5. **Consistent Spacing** - 4px grid system

## File Structure

| File | Purpose |
|------|---------|
| `src/app/globals.css` | CSS custom property definitions |
| `tailwind.config.ts` | Tailwind theme extension |
| `src/components/ui/` | UI component library |
| `docs/design-system/` | This documentation |

## Core Tokens

### Colors

| Token | Usage |
|-------|-------|
| `bg-background` | Primary surface (#05060a) |
| `bg-background-elevated` | Cards, dialogs (#0a0c10) |
| `bg-background-subtle` | Hover states (#10131a) |
| `text-foreground` | Primary text |
| `text-foreground-muted` | Secondary text (70% opacity) |
| `text-foreground-subtle` | Tertiary text (50% opacity) |
| `bg-primary` | Orange accent |
| `text-success` / `text-error` / `text-warning` / `text-info` | Semantic states |

### Shadows

| Token | Usage |
|-------|-------|
| `shadow-sm` | Subtle elevation |
| `shadow-lg` | Cards, dialogs |
| `shadow-glow-primary` | Interactive glow effect |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 6px | Badges |
| `rounded-md` | 8px | Inputs |
| `rounded-lg` | 12px | Buttons |
| `rounded-xl` | 16px | Cards |
| `rounded-2xl` | 20px | Large cards |

## Components

All components are in `src/components/ui/`:

- **Button** - Primary action component with variants
- **Card** - Container with elevated background
- **Input/Textarea** - Form inputs with dark styling
- **Select** - Dropdown with dark popover
- **Dialog** - Modal with backdrop blur
- **Badge** - Status indicators
- **Sonner** - Toast notifications (dark theme)

See [COMPONENTS.md](./COMPONENTS.md) for detailed usage.

## Migration Guide

When updating existing components:

```
text-gray-900 → text-foreground
text-gray-600 → text-foreground-muted
text-gray-400 → text-foreground-subtle
bg-white → bg-background-elevated
bg-gray-50 → bg-background-subtle
border-gray-200 → border-border
```

Remove all `dark:` prefixes - single theme means no conditionals needed.

## Related Documentation

- [DESIGN_TOKENS.md](./DESIGN_TOKENS.md) - Full token reference
- [COMPONENTS.md](./COMPONENTS.md) - Component usage guide
- [MIGRATION.md](./MIGRATION.md) - Migration guide for existing code
