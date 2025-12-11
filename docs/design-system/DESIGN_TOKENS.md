# Design Tokens Reference

Complete reference for all CSS custom properties defined in `src/app/globals.css`.

## Color Tokens

### Background Hierarchy

```css
--color-background: #05060a;           /* Primary surface */
--color-background-elevated: #0a0c10;  /* Cards, dialogs */
--color-background-subtle: #10131a;    /* Hover states */
--color-background-muted: #181c26;     /* Secondary surfaces */
```

**Tailwind Classes:**
- `bg-background` - Primary surface
- `bg-background-elevated` - Elevated elements
- `bg-background-subtle` - Subtle hover states
- `bg-background-muted` - Muted backgrounds

### Foreground Hierarchy

```css
--color-foreground: #f8fafc;                    /* Primary text */
--color-foreground-muted: rgba(248,250,252,0.7); /* Secondary text */
--color-foreground-subtle: rgba(248,250,252,0.5); /* Tertiary text */
```

**Tailwind Classes:**
- `text-foreground` - Primary text
- `text-foreground-muted` - Secondary text
- `text-foreground-subtle` - Placeholder/tertiary text

### Primary Accent (Orange)

```css
--color-primary: #f97316;           /* Orange-500 */
--color-primary-hover: #ea580c;     /* Orange-600 */
--color-primary-active: #c2410c;    /* Orange-700 */
--color-primary-foreground: #05060a; /* Text on primary */
--color-primary-muted: rgba(249,115,22,0.15); /* Subtle background */
```

**Tailwind Classes:**
- `bg-primary`, `text-primary` - Primary color
- `bg-primary-hover` - Hover state
- `bg-primary-muted` - Subtle background for selected states
- `text-primary-foreground` - Text on primary background

### Semantic Colors

#### Success (Green)
```css
--color-success: #10b981;
--color-success-hover: #059669;
--color-success-muted: rgba(16,185,129,0.15);
--color-success-foreground: #05060a;
```

#### Warning (Amber)
```css
--color-warning: #f59e0b;
--color-warning-hover: #d97706;
--color-warning-muted: rgba(245,158,11,0.15);
--color-warning-foreground: #05060a;
```

#### Error (Red)
```css
--color-error: #ef4444;
--color-error-hover: #dc2626;
--color-error-muted: rgba(239,68,68,0.15);
--color-error-foreground: #ffffff;
```

#### Info (Cyan)
```css
--color-info: #38bdf8;
--color-info-hover: #0ea5e9;
--color-info-muted: rgba(56,189,248,0.15);
--color-info-foreground: #05060a;
```

### Border Colors

```css
--color-border: rgba(248,250,252,0.1);       /* Default border */
--color-border-hover: rgba(248,250,252,0.2);  /* Hover state */
--color-border-focus: rgba(249,115,22,0.5);   /* Focus state (orange) */
```

### Input Colors

```css
--color-input: #0a0c10;                        /* Input background */
--color-input-border: rgba(248,250,252,0.15);  /* Input border */
--color-input-placeholder: rgba(248,250,252,0.4); /* Placeholder text */
--color-ring: rgba(249,115,22,0.5);            /* Focus ring */
```

## Radius Tokens

```css
--radius-sm: 0.375rem;   /* 6px - badges, small inputs */
--radius-md: 0.5rem;     /* 8px - buttons, inputs */
--radius-lg: 0.75rem;    /* 12px - cards, dialogs */
--radius-xl: 1rem;       /* 16px - large cards */
--radius-2xl: 1.25rem;   /* 20px - sections */
--radius-3xl: 1.5rem;    /* 24px - hero elements */
--radius-full: 9999px;   /* pills, avatars */
```

## Shadow Tokens

```css
--shadow-xs: 0 1px 2px rgba(0,0,0,0.3);
--shadow-sm: 0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 6px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3);
--shadow-lg: 0 10px 15px rgba(0,0,0,0.5), 0 4px 6px rgba(0,0,0,0.4);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.5), 0 8px 10px rgba(0,0,0,0.4);
--shadow-2xl: 0 25px 50px rgba(0,0,0,0.6);
--shadow-inner: inset 0 2px 4px rgba(0,0,0,0.3);
```

### Glow Effects

```css
--shadow-glow-primary: 0 0 20px rgba(249,115,22,0.35);
--shadow-glow-success: 0 0 20px rgba(16,185,129,0.35);
--shadow-glow-info: 0 0 20px rgba(56,189,248,0.35);
```

**Usage:** `shadow-glow-primary` for interactive elements on hover.

## Spacing Scale

Standard Tailwind scale is used with these additions:

```css
--spacing-4.5: 1.125rem;  /* 18px */
--spacing-5.5: 1.375rem;  /* 22px */
--spacing-13: 3.25rem;    /* 52px */
--spacing-15: 3.75rem;    /* 60px */
--spacing-18: 4.5rem;     /* 72px */
--spacing-22: 5.5rem;     /* 88px */
```

## Typography Scale

```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
--font-size-5xl: 3rem;      /* 48px */
--font-size-6xl: 3.75rem;   /* 60px */
```

## Transition Tokens

```css
--transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-normal: 200ms cubic-bezier(0.4, 0, 0.2, 1);
--transition-slow: 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

## Z-Index Scale

```css
z-dropdown: 1000
z-sticky: 1100
z-modal: 1200
z-popover: 1300
z-toast: 1400
z-tooltip: 1500
```
