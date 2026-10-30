import type { StoreMode } from "./types"

const modes: StoreMode[] = ["off", "mock", "medusa"]

/**
 * Decide whether the store is shown, and against which backend.
 *
 * An explicit `STORE_MODE` always wins. Without it, the mock store is shown
 * only on local and Workers preview hosts, so production (optic.works) stays
 * off until the owner sets `STORE_MODE` deliberately.
 */
export function resolveStoreMode(envMode: string | undefined, host: string | null | undefined): StoreMode {
  const explicit = envMode?.trim().toLowerCase()
  if (explicit) return modes.includes(explicit as StoreMode) ? (explicit as StoreMode) : "off"

  const hostname = (host ?? "").toLowerCase().replace(/:\d+$/, "")
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname.endsWith(".workers.dev")) return "mock"
  return "off"
}
