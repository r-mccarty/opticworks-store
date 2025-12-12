## OpticWorks Storefront Design System (Code)

This storefront is being refactored to a single, token‑driven UI system inspired by Daylight, Grok, and Oxide.
Routes stay stable; UI/UX and information architecture are free to evolve.

### Tokens

Tokens live in `src/app/globals.css` inside the `@theme` block (light defaults) and `.dark` overrides.

**Core semantic colors**

- `background`, `foreground`
- `card`, `card-foreground`
- `popover`, `popover-foreground`
- `muted`, `muted-foreground`
- `border`, `input`, `ring`
- `primary`, `primary-foreground` (brand orange)
- `secondary`, `secondary-foreground` (brand lime)
- `accent`, `accent-foreground`
- `destructive`, `destructive-foreground`

Utilities are used via Tailwind classes like `bg-background`, `text-foreground`, `border-border`, `bg-primary`, etc.

**Radii**

- `--radius-xs/sm/md/lg/xl` → classes `rounded-xs`, `rounded-sm`, etc.

**Elevation**

- `--shadow-elevation-1/2/3` → classes `shadow-elevation-1`, etc.

**Motion**

- `--ease-standard`, `--ease-emphasized` → classes `ease-standard`, `ease-emphasized`.
- Existing `--animate-*` and keyframes remain and are expanded as needed.

**Fonts**

- `--font-sans`: Colfax (body/UI)
- `--font-display`: Feature Flat (hero/marketing)
- `--font-mono`: Geist Mono (monotype)

### Theme control

`next-themes` sets a `dark` class on `<html>`. The `.dark` section in `globals.css` overrides tokens for dark mode.
New components must never hard‑code colors; always use semantic classes so both themes stay in parity.

### Component conventions

- Use semantic Tailwind utilities (`bg-card`, `text-muted-foreground`, `shadow-elevation-1`) instead of raw color values.
- Prefer `cva`/`tailwind-variants` for variants, and keep props strictly typed (no `any`).
- Motion uses tokenized easings and durations; avoid ad‑hoc cubic‑beziers.

### Roadmap

1. Token foundation (this file + `globals.css` + Tailwind theme).
2. Rebuild primitives in `src/components/ui`.
3. Redesign global chrome (`MenuBar`, `Footer`, command palette).
4. Refactor Home → Products → Product Detail.
5. Refactor commerce/auth/support pages.
