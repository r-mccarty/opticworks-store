/**
 * Development journal.
 *
 * Entries must describe real engineering work and be approved for publication.
 * Entries with `draft: true` are never rendered, listed, or included in the sitemap
 * or feed. Flip to `false` only after owner review.
 */

export interface JournalEntry {
  slug: string
  title: string
  /** ISO date (YYYY-MM-DD) the work or decision took place. */
  date: string
  program: "vmc" | "mach-1" | "platform" | "company"
  summary: string
  body: string[]
  draft: boolean
}

const entries: JournalEntry[] = [
  {
    slug: "scoping-the-first-vmc-build",
    title: "Scoping the first VMC build",
    date: "2026-10-20",
    program: "vmc",
    summary:
      "Why the first prototype is being built without its automatic tool changer, and why the tool changer is still a first-class part of the project.",
    body: [
      "The first compact VMC prototype includes the machine, its supporting frame and its enclosure. It does not include the automatic tool changer's magazines or transfer mechanism.",
      "That is a sequencing decision, not a change of direction. The tool changer remains an active subsystem with its own design review, interfaces and qualification plan, and the first build keeps the structure it will mount to.",
      "Getting the core machine fabricated, assembled and qualified is the higher priority. Making the first build wait for a finished tool changer would hold up everything else we need to learn from the machine.",
    ],
    draft: true,
  },
  {
    slug: "fit-checking-with-printed-models",
    title: "Finding interface problems before cutting metal",
    date: "2026-10-15",
    program: "vmc",
    summary:
      "How we use printed scale and full-size section models, generated directly from the CAD, to find where modeled interfaces disagree.",
    body: [
      "Before machining any interface on the prototype, we print physical models generated directly from the native CAD: half-scale versions of the major structural parts, and full-size sections through the sliding interfaces.",
      "The aim is to expose where the model is wrong. Assembling printed parts quickly shows registration errors, inaccessible fasteners and interferences that are easy to miss on screen.",
      "Printed fit never certifies the real parts. Scaling halves running clearances, and printer error can look like a design error. Anything consequential is re-checked against the real hardware before it changes the design.",
    ],
    draft: true,
  },
]

const byDateDesc = (a: JournalEntry, b: JournalEntry) => b.date.localeCompare(a.date)

/** Published entries only, newest first. */
export function getPublishedEntries(): JournalEntry[] {
  return entries.filter((entry) => !entry.draft).sort(byDateDesc)
}

export function getPublishedEntry(slug: string): JournalEntry | undefined {
  return getPublishedEntries().find((entry) => entry.slug === slug)
}

/** All entries including drafts; for tests and tooling, never for rendering. */
export function getAllEntriesForReview(): JournalEntry[] {
  return [...entries].sort(byDateDesc)
}
