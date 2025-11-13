# @opticworks/design-system

Token-based design system for OpticWorks platform, inspired by TweakCN approach for type-safe, themeable design tokens.

## Overview

This package provides a centralized design system with:
- **Design tokens** (colors, typography, spacing, animations)
- **Shared UI components** (built on Shadcn/ui + custom)
- **Theme configuration** for Tailwind CSS
- **Type-safe token access** via TypeScript

## Design Goals

1. **Token-Based**: All design decisions expressed as tokens
2. **Type-Safe**: Full TypeScript support for autocomplete
3. **Themeable**: Support light/dark modes and brand customization
4. **Grid-Focused**: Built-in grid system with visible gridlines
5. **Lime Green Brand**: Primary color inspired by Work Louder and Modal keyboards

## Directory Structure

```
packages/design-system/
├── src/
│   ├── tokens/
│   │   ├── colors.ts           # Color token definitions
│   │   ├── typography.ts       # Typography scales
│   │   ├── spacing.ts          # Spacing system (8px baseline)
│   │   ├── animations.ts       # Easing and duration tokens
│   │   └── index.ts           # Token exports
│   ├── components/
│   │   ├── ui/                # Shadcn/ui components (accessibility)
│   │   └── custom/            # Custom components (brand-focused)
│   ├── utils/
│   │   ├── cn.ts              # Class utility (for Shadcn)
│   │   └── cx.ts              # Class utility (for custom components)
│   ├── tailwind/
│   │   └── preset.ts          # Tailwind preset with tokens
│   └── index.ts               # Main exports
├── package.json
├── tsconfig.json
└── README.md
```

## Installation & Setup

**Install dependencies:**
```bash
cd packages/design-system
pnpm install
```

**Use in apps:**
```json
// apps/storefront/package.json
{
  "dependencies": {
    "@opticworks/design-system": "workspace:*"
  }
}
```

**Import in code:**
```typescript
import { colors, typography } from '@opticworks/design-system/tokens'
import { Button } from '@opticworks/design-system/components/ui'
import { cn } from '@opticworks/design-system/utils'
```

## Token Schema

### Colors

Inspired by Work Louder and Modal keyboards, featuring lime green as the primary brand color.

```typescript
export const colors = {
  // Brand colors
  brand: {
    lime: {
      50: '#f7fee7',
      100: '#ecfccb',
      200: '#d9f99d',
      300: '#bef264',  // Primary lime green
      400: '#a3e635',
      500: '#84cc16',
      600: '#65a30d',
      700: '#4d7c0f',
      800: '#3f6212',
      900: '#365314',
    },
    modal: {
      // Modal keyboard inspired accent
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
    }
  },

  // Semantic colors
  primary: 'var(--color-brand-lime-400)',
  secondary: 'var(--color-brand-modal-500)',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',

  // Neutral colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  }
} as const
```

### Typography

Based on Geist font family (already in use) with a modular scale.

```typescript
export const typography = {
  fontFamily: {
    sans: 'var(--font-geist-sans)',
    mono: 'var(--font-geist-mono)',
  },

  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
  },

  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  }
} as const
```

### Spacing

8px baseline grid system.

```typescript
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  2: '0.5rem',      // 8px  - baseline
  3: '0.75rem',     // 12px
  4: '1rem',        // 16px - baseline * 2
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px - baseline * 3
  8: '2rem',        // 32px - baseline * 4
  10: '2.5rem',     // 40px
  12: '3rem',       // 48px - baseline * 6
  16: '4rem',       // 64px - baseline * 8
  20: '5rem',       // 80px
  24: '6rem',       // 96px - baseline * 12
  32: '8rem',       // 128px
  40: '10rem',      // 160px
  48: '12rem',      // 192px
  56: '14rem',      // 224px
  64: '16rem',      // 256px
} as const
```

### Grid System

Built-in grid overlay for visual consistency during development.

```typescript
export const grid = {
  columns: 12,
  gutter: '2rem',      // 32px
  baseline: '0.5rem',  // 8px

  // Grid overlay utilities
  overlay: {
    color: 'rgba(163, 230, 53, 0.1)', // Lime green with opacity
    width: '1px',
    style: 'dashed',
  }
} as const
```

### Animations

Easing functions and duration tokens.

```typescript
export const animations = {
  duration: {
    instant: '100ms',
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
    slower: '700ms',
  },

  easing: {
    linear: 'linear',
    ease: 'ease',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    // Custom easing for smooth Lenis-style animations
    smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  }
} as const
```

## Usage Examples

### Using Tokens in Components

```typescript
import { colors, spacing, typography } from '@opticworks/design-system/tokens'

// In styled components or inline styles
<div style={{
  color: colors.brand.lime[400],
  padding: spacing[4],
  fontSize: typography.fontSize.lg[0],
}}>
  OpticWorks
</div>
```

### Using with Tailwind (Recommended)

```typescript
// apps/storefront/tailwind.config.js
import { preset } from '@opticworks/design-system/tailwind'

export default {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx}',
    '../../packages/design-system/src/**/*.{ts,tsx}',
  ],
}
```

Then in components:
```tsx
<button className="bg-brand-lime-400 text-neutral-900 px-4 py-2">
  Shop Now
</button>
```

### Grid Overlay (Development)

```tsx
import { GridOverlay } from '@opticworks/design-system/components/custom'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {process.env.NODE_ENV === 'development' && <GridOverlay />}
        {children}
      </body>
    </html>
  )
}
```

## Component Guidelines

### When to Use Shadcn/ui Components

Use Shadcn/ui components (in `components/ui/`) for:
- Forms and inputs
- Dialogs and modals
- Accessible interactive elements
- Components requiring ARIA attributes

Example:
```tsx
import { Button } from '@opticworks/design-system/components/ui'

<Button variant="default" size="lg">
  Add to Cart
</Button>
```

### When to Use Custom Components

Use custom components (in `components/custom/`) for:
- Marketing sections
- Brand-specific features
- Complex animations
- Tesla-specific visualizations

Example:
```tsx
import { Hero } from '@opticworks/design-system/components/custom'

<Hero
  title="Window Tinting Made Easy"
  subtitle="For Tesla Model Y"
  primaryColor="lime"
/>
```

## Development Workflow

1. **Add new tokens**: Edit files in `src/tokens/`
2. **Update Tailwind preset**: Regenerate in `src/tailwind/preset.ts`
3. **Create components**: Add to `src/components/ui/` or `src/components/custom/`
4. **Export**: Update `src/index.ts`
5. **Document**: Add usage examples to this README
6. **Test**: Use in storefront and verify appearance

## TODO: Implementation Checklist

### Phase 1: Token Foundation
- [ ] Create `src/tokens/colors.ts` with lime green palette
- [ ] Create `src/tokens/typography.ts` with Geist font scales
- [ ] Create `src/tokens/spacing.ts` with 8px baseline
- [ ] Create `src/tokens/animations.ts` with easing functions
- [ ] Create `src/tokens/grid.ts` with grid system
- [ ] Create `src/tokens/index.ts` to export all tokens

### Phase 2: Tailwind Integration
- [ ] Create `src/tailwind/preset.ts` to convert tokens to Tailwind config
- [ ] Test preset in storefront
- [ ] Document theme customization

### Phase 3: Component Migration
- [ ] Set up `src/components/ui/` directory
- [ ] Copy existing Shadcn components from storefront
- [ ] Refactor to use design tokens
- [ ] Set up `src/components/custom/` directory
- [ ] Migrate custom components (Hero, Features, etc.)
- [ ] Update imports in storefront

### Phase 4: Grid System
- [ ] Create `GridOverlay` component for development
- [ ] Add grid utilities to Tailwind preset
- [ ] Document grid usage patterns

### Phase 5: Documentation
- [ ] Create Storybook or similar for component showcase
- [ ] Add usage examples for all tokens
- [ ] Create migration guide for existing components
- [ ] Document accessibility considerations

## Dependencies

```json
{
  "dependencies": {
    "@radix-ui/react-slot": "^1.2.3",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.6.0",
    "tailwind-variants": "^0.3.1"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "4.1.12",
    "tailwindcss": "4.1.12",
    "typescript": "^5.9.2"
  },
  "peerDependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1"
  }
}
```

## References

- [TweakCN Approach](https://github.com/mattprodani/tweakcn) - Type-safe design tokens
- [Shadcn/ui](https://ui.shadcn.com/) - Accessible component patterns
- [Work Louder](https://worklouder.cc/) - Brand color inspiration
- [Modal Keyboards](https://www.modalkeyboards.com/) - Design language inspiration
- [Tailwind CSS v4](https://tailwindcss.com/docs) - Styling framework

## Support

For questions or issues related to the design system:
1. Check the migration plan: `/docs/MIGRATION_PLAN.md`
2. Review token schemas in `/packages/design-system/src/tokens/`
3. See component examples in `/apps/storefront/`
