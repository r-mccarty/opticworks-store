import Link from "next/link"
import type { ReactNode } from "react"

import { cx } from "@/lib/utils"
import { claimStatusLabels, stageLabels, type ClaimStatus, type ProgramStage } from "@/content/programs"

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cx("mx-auto w-full max-w-7xl px-5 sm:px-8", className)}>{children}</div>
}

/** Page section with a top hairline and consistent vertical rhythm. */
export function Section({
  id,
  className,
  children,
  labelledBy,
}: {
  id?: string
  className?: string
  children: ReactNode
  labelledBy?: string
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={cx("border-t border-line py-20 sm:py-28", className)}>
      <Container>{children}</Container>
    </section>
  )
}

/**
 * Section heading with a technical index ("01") and annotation label,
 * aligned to a two-column grid on wide screens.
 */
export function SectionHeading({
  id,
  index,
  label,
  title,
  lede,
  as: Heading = "h2",
}: {
  id?: string
  index?: string
  label: string
  title: ReactNode
  lede?: ReactNode
  as?: "h1" | "h2"
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      <p className="annotation flex items-center gap-3 lg:col-span-3 lg:pt-2">
        {index && <span className="text-amber">{index}</span>}
        <span aria-hidden className="h-px w-6 bg-line-strong" />
        <span>{label}</span>
      </p>
      <div className="lg:col-span-9">
        <Heading
          id={id}
          className={cx(
            "max-w-4xl text-balance font-display font-light tracking-tight text-text",
            Heading === "h1" ? "text-4xl sm:text-5xl lg:text-6xl" : "text-3xl sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
          )}
        >
          {title}
        </Heading>
        {lede && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-text-muted">{lede}</div>}
      </div>
    </div>
  )
}

export function ArrowLink({
  href,
  children,
  variant = "text",
  className,
}: {
  href: string
  children: ReactNode
  variant?: "primary" | "secondary" | "text"
  className?: string
}) {
  const styles = {
    primary:
      "bg-amber px-5 py-3 text-ink hover:bg-amber-strong",
    secondary:
      "border border-line-strong px-5 py-3 text-text hover:border-amber hover:text-amber-strong",
    text: "text-amber hover:text-amber-strong",
  }[variant]

  return (
    <Link
      href={href}
      className={cx(
        "group inline-flex items-center gap-2 rounded-sm text-sm font-medium transition-colors duration-200",
        styles,
        className,
      )}
    >
      {children}
      <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">
        →
      </span>
    </Link>
  )
}

export function StagePill({ stage }: { stage: ProgramStage }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-sm border border-line-strong px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.12em] text-text-muted">
      <span aria-hidden className="size-1.5 rounded-full bg-amber" />
      {stageLabels[stage]}
    </span>
  )
}

const claimTone: Record<ClaimStatus, string> = {
  validated: "border-amber text-amber-strong",
  "in-development": "border-line-strong text-text",
  objective: "border-line text-text-muted",
  vision: "border-dashed border-line-strong text-text-subtle",
}

export function ClaimStatusTag({ status }: { status: ClaimStatus }) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[0.625rem] uppercase tracking-[0.12em]",
        claimTone[status],
      )}
    >
      {claimStatusLabels[status]}
    </span>
  )
}

/** Opening block for interior pages: h1 heading with registration-grid backdrop. */
export function PageIntro({
  label,
  title,
  lede,
  children,
}: {
  label: string
  title: ReactNode
  lede?: ReactNode
  children?: ReactNode
}) {
  return (
    <section aria-labelledby="page-title" className="relative overflow-hidden">
      <div
        aria-hidden
        className="registration-grid absolute inset-0 opacity-40 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />
      <Container className="relative pb-16 pt-20 sm:pb-20 sm:pt-28">
        <SectionHeading id="page-title" as="h1" label={label} title={title} lede={lede} />
        {children && <div className="mt-10 lg:ml-[25%] lg:pl-2">{children}</div>}
      </Container>
    </section>
  )
}
