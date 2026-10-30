import type { Program, ProgramMedia } from "@/content/programs"
import { cx } from "@/lib/utils"

import { ArrowLink, ClaimStatusTag, StagePill } from "./primitives"
import { Mach1Schematic, RegistrationMark, VmcSchematic } from "./visuals"

export function ProgramFigure({ media, className }: { media: ProgramMedia; className?: string }) {
  return (
    <figure className={cx("relative", className)}>
      <div className="registration-grid relative aspect-[6/5] overflow-hidden rounded-sm border border-line bg-surface/40">
        <RegistrationMark className="absolute left-3 top-3 text-line-strong" size={18} />
        <RegistrationMark className="absolute bottom-3 right-3 text-line-strong" size={18} />
        <div className="absolute inset-6 sm:inset-10">
          {media.kind === "illustration" && media.illustration === "vmc-schematic" && <VmcSchematic />}
          {media.kind === "illustration" && media.illustration === "mach1-schematic" && <Mach1Schematic />}
          {media.kind !== "illustration" && media.src && (
            // eslint-disable-next-line @next/next/no-img-element -- static export without image optimization
            <img src={media.src} alt={media.alt} className="h-full w-full object-contain" />
          )}
        </div>
        {media.kind === "illustration" && <span className="sr-only">{media.alt}</span>}
      </div>
      <figcaption className="annotation mt-3 normal-case tracking-[0.04em]">{media.caption}</figcaption>
    </figure>
  )
}

/** Large alternating feature block used on the homepage and products overview. */
export function ProgramFeature({
  program,
  index,
  reverse = false,
  headingLevel = "h2",
}: {
  program: Program
  index: string
  reverse?: boolean
  headingLevel?: "h2" | "h3"
}) {
  const Heading = headingLevel
  const media = program.media[0]
  const href = `/products/${program.slug}`

  return (
    <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
      <div className={cx("lg:col-span-6", reverse && "lg:order-2")}>
        {media && <ProgramFigure media={media} />}
      </div>
      <div className={cx("lg:col-span-6", reverse && "lg:order-1")}>
        <p className="annotation flex items-center gap-3">
          <span className="text-amber">{index}</span>
          <span aria-hidden className="h-px w-6 bg-line-strong" />
          {program.category}
        </p>
        <Heading className="mt-6 text-3xl font-light tracking-tight text-text sm:text-4xl">{program.name}</Heading>
        <p className="mt-3 text-lg text-text">{program.tagline}</p>
        <p className="mt-5 max-w-xl leading-relaxed text-text-muted">{program.summary}</p>
        <div className="mt-6">
          <StagePill stage={program.stage} />
        </div>
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {program.capabilities.slice(0, 4).map((capability) => (
            <li key={capability.title} className="flex items-center justify-between gap-4 py-3">
              <span className="text-sm text-text">{capability.title}</span>
              <ClaimStatusTag status={capability.status} />
            </li>
          ))}
        </ul>
        <div className="mt-8">
          <ArrowLink href={href}>Explore {program.name}</ArrowLink>
        </div>
      </div>
    </div>
  )
}
