# AGENTS.md

This canonical guidance covers the **OpticWorks Presence Intelligence Platform**—our pivot from Tesla tint kits to mmWave-powered smart-home presence sensors. `CLAUDE.md` is now a hard link to this file, so edits here automatically sync there.

## Platform Snapshot
- **Product**: CyberShade Presence family (bed sensors, under-mattress radar tiles, occupancy bridges)
- **Customers**: Premium smart-home owners, integrators, boutique installers, and sleep-optimization clinics
- **Promise**: "Perfect presence"—lag-free automations, privacy-first telemetry, beautiful industrial design
- **Business Model**: Hardware + recurrent subscription for analytics, upsell kits (Pro Core, Studio bundles, OEM trays)
- **Key Differentiators**: Apple-grade industrial design cues, zero-cloud requirement, native Home Assistant and Matter hooks

## Technology Stack & Workflow
- **Framework**: Next.js 15.5.0 (App Router + React 19.1.1)
- **Language**: TypeScript 5.9.2 in strict mode (absolutely no `any`)
- **Styling**: Tailwind CSS 4.1.12 with the two-tier component system (`cn` for Shadcn, `cx` for bespoke UI)
- **State**: Zustand 5.0.8 (cart + support stores persist, checkout store is ephemeral)
- **Package Manager**: pnpm only
- **Animation/Visualization**: Framer Motion, custom Three.js Tesla bed-simulation scenes

### Critical Commands
```bash
pnpm install        # dependencies
pnpm run dev        # http://localhost:3000
pnpm run lint       # REQUIRED before commits
pnpm run build      # REQUIRED before commits
pnpm run start      # production preview
```
Never skip `pnpm run lint` + `pnpm run build`—CI mirrors strict local expectations.

## Repository Map (Presence-focused)
```
src/
├── app/
│   ├── page.tsx                 # Presence landing page
│   ├── products/                # Sensor catalog (bed tiles, bridge, OEM trays)
│   ├── store/                   # Cart + checkout + success flows
│   ├── support/                 # Warranty, "Oops Protection", compliance center
│   ├── install-guides/          # Sensor mounting + calibration guides
│   └── api/                     # Stripe/email production routes + sensor ops stubs
├── components/
│   ├── ui/                      # Tier 1 + Tier 2 components (Hero, Features, SensorGrid)
│   ├── checkout/                # Stripe hybrid flow
│   ├── store/, support/, products/, 3d/
├── hooks/                      # Zustand stores (`useCart`, `useCheckoutState`, `useSupportStore`)
├── lib/
│   ├── api/                     # Tint-law legacy + presence compliance utilities
│   ├── products.ts              # Sensor catalog metadata
│   └── utils.ts                 # `cn`, `cx`, shared helpers
└── docs/                       # CODEBASE_EXPLANATION, STATE_MANAGEMENT, API_STUBS, STRIPE_INTEGRATION
```
Keep directory intent intact; presence pivot changes stories, not patterns.

## Two-Tier Component System
- **Tier 1 (Shadcn/ui)**: Buttons, forms, dialogs, inputs, any accessibility-sensitive control. Always import `cn` from `@/lib/utils`.
- **Tier 2 (Custom Business UI)**: Hero, Features, SensorFocus, Installation Timeline. Use `cx`, gradient-heavy art direction, motion cues, glassmorphism.
- Accessibility is non-negotiable: keyboard nav, ARIA, and semantic headings.

## Core Experience Blueprint
1. **Landing Narrative**: highlight bed-sensor hero, show occupancy heatmaps, emphasize "Built to fix every pain point smart homes have with bed sensors" section.
2. **Product Detail Pages**: specs for CyberShade Presence Pro, Sleep Deck, Integrator Bundle. Include VLT legacy info only when relevant to tinted privacy films accessory kits.
3. **Configurator & Cart**: persistent cart via `useCart`, shipping + taxes explained as "calculated after calibration" copy tweaks.
4. **Checkout**: `CheckoutWrapper` bootstraps Stripe Elements + custom fonts, `CheckoutForm` handles Address + Payment Elements, success page ties back into `paymentSession`.
5. **Support**: warranty claims for sensor membranes, troubleshooting radar noise, compatibility with adjustable bases.

## API & Service Layer
- **Production**: Stripe checkout/webhook, `/api/email/send` (Resend), environment gating via required secrets.
- **Presence Stubs** (follow `docs/API_STUBS.md` patterns): `/api/shipping/rates`, `/api/inventory/check` (sensor batches), `/api/analytics/events` (presence diagnostics), `/api/compatibility/bed` (calibration hints).
- Always simulate latency (300–800 ms), validate payloads, and return realistic mock data.

## Domain Knowledge: Presence Sensors
- **Sensing Modalities**: mmWave radar with temporal filtering, 4-state machine, still-energy mode, presence confidence scoring.
- **Bed Sensor Differentiators**: stillness resilience, multi-body detection, HVAC immunity, privacy-by-design (no images, all on-device compute).
- **Calibration Workflow**: baseline capture (Z-score), adaptive thresholds, "Absolute Clear Delay" resets, integration with Home Assistant DIY dashboards.
- **Compliance**: Sleep clinics require HIPAA-safe copy; EU shipments require CE + GDPR-compliant messaging; highlight "no cloud" to satisfy privacy expectations.

## State Management Rules
- `useCart`: persistent (localStorage `cart-storage`), toast feedback via Sonner, handles `paymentSession` for success state.
- `useCheckoutState`: ephemeral, never persisted, tracks tax, totals, shipping address.
- `useSupportStore`: persistent forms + ticket drafts; ensures warranty + contact flows survive navigation.
- Never introduce `any`; derive types from `lib/products` or interface definitions.

## Forms & Validation Pattern
```typescript
const schema = z.object({
  email: z.string().email(),
  baseType: z.enum(["Platform", "Split", "Adjustable"]),
  notes: z.string().min(10),
})
const form = useForm<SensorInquiry>({ resolver: zodResolver(schema) })
```
Always pair with Shadcn `<Form>`, `<FormField>`, `<FormItem>`, `<FormControl>`, `<FormMessage>` and accessible labels.

## UI & Performance Standards
- Next.js `<Image>` for hero visuals + sensor renders.
- Heavy 3D/animation blocks use lazy loading or suspense boundaries.
- Provide skeletons/loading states for fetch-heavy sections (inventory, analytics, shipping).
- Keep gradients/tints consistent with new Apple-like art direction (light glass, depth, subtle noise).

## Testing & QA Checklist
1. `pnpm run lint`
2. `pnpm run build`
3. Manual flows: add-to-cart → checkout → success, support ticket submission, product detail interactions, sensor comparison carousel.
4. Mobile + desktop review for Cards/Features (visual polish is part of MVP criteria).

## Collaboration Notes
- This document is mirrored via filesystem hard link at `CLAUDE.md`. Update either name and both stay in sync.
- Read `docs/CODEBASE_EXPLANATION.md` for architecture deep dives and `docs/STATE_MANAGEMENT.md` for advanced Zustand persistence patterns.
- When unsure about presence copy or heuristics, mirror the tone of the landing hero: confident, privacy-forward, premium hardware storytelling.
