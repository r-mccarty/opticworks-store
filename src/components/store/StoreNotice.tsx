import type { StoreMode } from "@/lib/store/types"
import { cx } from "@/lib/utils"

const notices: Record<Exclude<StoreMode, "off">, string> = {
  mock: "Preview store. Prices are provisional and subject to change; checkout is simulated, so no order is placed and no payment is taken.",
  medusa:
    "Test store connected to the OpticWorks backend in test mode. Prices are provisional and subject to change; checkout stops before payment.",
}

export function StoreNotice({ mode, className }: { mode: Exclude<StoreMode, "off">; className?: string }) {
  return (
    <p
      role="note"
      className={cx(
        "border-amber/60 bg-amber-dim text-text-muted rounded-sm border border-dashed px-4 py-3 text-sm leading-relaxed",
        className,
      )}
    >
      <span className="text-amber-strong mr-2 font-mono text-[0.6875rem] tracking-[0.12em] uppercase">
        {mode === "mock" ? "Mock" : "Test mode"}
      </span>
      {notices[mode]}
    </p>
  )
}
