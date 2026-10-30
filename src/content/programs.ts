/**
 * Public product and development-program content.
 *
 * This is the source of truth for what the website says about a product. It is
 * intentionally independent of commerce: the store backend supplies saleable
 * variants, pricing and ordering, keyed by `commerce.productHandle`, without
 * owning the public narrative below.
 *
 * Every capability carries an explicit claim status. Only use "validated" for
 * something demonstrated on hardware and approved for publication.
 */

export type ProgramStage = "concept" | "early-development" | "prototype" | "available"

export type ClaimStatus =
  /** Demonstrated on hardware and approved for publication. */
  | "validated"
  /** Actively being built or tested; not yet demonstrated. */
  | "in-development"
  /** An intended property of the product; not yet built or tested. */
  | "objective"
  /** Long-term direction beyond the current program. */
  | "vision"

export interface ProgramCapability {
  title: string
  description: string
  status: ClaimStatus
}

export interface ProgramSection {
  heading: string
  body: string[]
}

export interface ProgramMedia {
  kind: "illustration" | "cad-render" | "photograph"
  /** Component key in src/components/site/visuals (illustrations only). */
  illustration?: "vmc-schematic" | "mach1-schematic"
  src?: string
  alt: string
  caption: string
}

export interface Program {
  slug: string
  name: string
  category: "Precision manufacturing" | "Advanced imaging and perception"
  stage: ProgramStage
  /** One-line public development status. */
  statusNote: string
  tagline: string
  summary: string
  sections: ProgramSection[]
  capabilities: ProgramCapability[]
  media: ProgramMedia[]
  cta: { label: string; href: string }
  /**
   * The backend product for this program (Medusa handle). Price, availability and
   * ordering come from the store backend, never from this file.
   */
  commerce?: { productHandle: string }
}

export const stageLabels: Record<ProgramStage, string> = {
  concept: "Concept",
  "early-development": "Early development",
  prototype: "Prototype in development",
  available: "Available",
}

export const claimStatusLabels: Record<ClaimStatus, string> = {
  validated: "Validated",
  "in-development": "In development",
  objective: "Design objective",
  vision: "Long-term vision",
}

export const programs: Program[] = [
  {
    slug: "vmc",
    name: "Compact VMC",
    category: "Precision manufacturing",
    stage: "prototype",
    statusNote:
      "Prototype in development. The first machine is being built and has not yet been commissioned. Nothing below has been validated on hardware yet.",
    tagline: "Serious CNC machining, sized for smaller workshops.",
    summary:
      "A compact vertical machining center designed to make capable, automated CNC machining accessible to smaller workshops, with control software, sensing and automation integrated from the start.",
    sections: [
      {
        heading: "Why a compact VMC",
        body: [
          "Capable machining centers have traditionally assumed industrial floor space, industrial power and an experienced operator. Smaller workshops are left choosing between hobby machines and equipment they cannot install or run.",
          "The compact VMC is our commercial entry point: a serious machine in a smaller envelope, designed around the people who will set it up and use it every day.",
        ],
      },
      {
        heading: "The intended experience",
        body: [
          "Ordinary residential power is a design objective. The machine is built around an ISO20 tooling architecture with automatic tool changing, and its control software, sensing and automation are designed as one system rather than added afterwards.",
          "The goal is easier setup, calibration and everyday operation: fewer specialist steps between installing the machine and making good parts.",
        ],
      },
      {
        heading: "Part of a larger system",
        body: [
          "The VMC is the first machine in a longer-term vision of modular, automated manufacturing equipment that shares the same software and sensing foundation.",
        ],
      },
    ],
    capabilities: [
      {
        title: "Compact footprint",
        description: "Sized for smaller workshops rather than industrial floor space.",
        status: "objective",
      },
      {
        title: "Ordinary residential power",
        description: "Designed to run without an industrial electrical installation.",
        status: "objective",
      },
      {
        title: "ISO20 automatic tooling",
        description:
          "ISO20 tooling architecture with an automatic tool changer, developed as its own subsystem alongside the first build.",
        status: "in-development",
      },
      {
        title: "Integrated control, sensing and automation",
        description: "One software environment for machine control, sensing and automated workflows.",
        status: "objective",
      },
      {
        title: "Guided setup and calibration",
        description: "Setup, calibration and everyday operation designed to need fewer specialist steps.",
        status: "objective",
      },
      {
        title: "Modular machine ecosystem",
        description: "Future machines and modules built on the same platform.",
        status: "vision",
      },
    ],
    media: [
      {
        kind: "illustration",
        illustration: "vmc-schematic",
        alt: "Schematic line illustration of a compact vertical machining center: column, spindle head, worktable and enclosure outline.",
        caption: "Schematic illustration, not to scale. Not a CAD render or photograph of the prototype.",
      },
    ],
    cta: { label: "Follow development", href: "/journal" },
    commerce: { productHandle: "vmc" },
  },
  {
    slug: "mach-1",
    name: "Mach 1",
    category: "Advanced imaging and perception",
    stage: "early-development",
    statusNote:
      "Development program. Mach 1 is not a product you can buy, and we have not published specifications. Internal performance targets have not been validated.",
    tagline: "High-speed imaging, made accessible.",
    summary:
      "Mach 1 is OpticWorks' high-speed camera program and the center of our work in imaging and perception: high-speed capture, advanced sensing and image processing for scientific and engineering use.",
    sections: [
      {
        heading: "Seeing what happens too fast to see",
        body: [
          "Many of the most important events in engineering and science happen faster than the eye or a conventional camera can follow. High-speed imaging makes them observable, measurable and repeatable.",
          "Mach 1 explores how to make that kind of instrumentation more accessible to the engineers and researchers who need it.",
        ],
      },
      {
        heading: "Perception across the company",
        body: [
          "The sensing and image-processing work in Mach 1 is also how our other machines will perceive the physical world. It feeds directly into the platform that connects our hardware.",
        ],
      },
    ],
    capabilities: [
      {
        title: "High-speed imaging",
        description: "Capturing fast physical events for observation and measurement.",
        status: "objective",
      },
      {
        title: "Advanced sensing",
        description: "Sensor and capture techniques that extend what an instrument can perceive.",
        status: "objective",
      },
      {
        title: "Image processing",
        description: "Turning high-speed capture into usable measurements and insight.",
        status: "objective",
      },
      {
        title: "Accessible instrumentation",
        description: "Scientific and engineering imaging that is practical for smaller teams to adopt.",
        status: "objective",
      },
    ],
    media: [
      {
        kind: "illustration",
        illustration: "mach1-schematic",
        alt: "Abstract illustration of a fast waveform sampled by a sequence of frames.",
        caption: "Conceptual illustration of high-speed frame sampling. Not product imagery.",
      },
    ],
    cta: { label: "Follow development", href: "/journal" },
    commerce: { productHandle: "mach-1" },
  },
]

export function getProgram(slug: string): Program | undefined {
  return programs.find((program) => program.slug === slug)
}
