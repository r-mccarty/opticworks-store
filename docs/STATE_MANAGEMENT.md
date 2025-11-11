# State Management

The sensing marketing site is intentionally lightweight: all content is statically generated or derived from shared TypeScript data structures. There is no client-side state store such as Zustand anymore. This simplifies hydration and keeps the site ready for deployment on Cloudflare Pages without additional runtime dependencies.

## Guiding Principles

1. **Static-first** – Marketing copy lives in `src/lib/marketingContent.ts` and is imported directly by pages.
2. **No persistent client state** – All interactive experiences rely on native links and pre-rendered content.
3. **Edge-ready** – Avoids `localStorage`/`sessionStorage` dependencies so the site can render entirely on the server/edge.

## When State Is Needed

If future features require interactivity (e.g., configuration calculators or live API previews), prefer:

- **Server Components** for data fetched from the Worker BFF or Hetzner backend.
- **Client Components** with local `useState` or React Query for transient interactions.
- **Persistent state** only when absolutely necessary, ideally in the backend (Workers KV/Durable Objects) rather than the browser.

## Migration Notes

Legacy Zustand stores (`useCart`, `useSupportStore`, `useCheckoutState`) were removed during the pivot from e-commerce to smart home sensing. Any new stateful functionality should document its requirements and rely on the Worker BFF instead of local persistence.
