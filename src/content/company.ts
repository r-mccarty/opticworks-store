/**
 * Company-level public copy shared by the homepage, About, Technology and Platform pages.
 * Describe intent and direction honestly; don't present objectives as shipped capability.
 */

export const mission =
  "OpticWorks develops advanced hardware and software that expand human perception and capability."

export const areasOfWork = [
  {
    title: "Precision manufacturing",
    description:
      "A compact vertical machining center is our near-term commercial development project. The long-term vision is modular, automated manufacturing equipment.",
    href: "/products/vmc",
  },
  {
    title: "Advanced imaging and perception",
    description:
      "The Mach 1 high-speed camera program anchors our work in imaging, sensing and image processing.",
    href: "/products/mach-1",
  },
  {
    title: "Intelligent software",
    description:
      "A unified software environment intended to make complex machines more accessible through integrated sensing, automation and AI-native workflows.",
    href: "/platform",
  },
] as const

export const principles = [
  {
    title: "Reduce complexity for the user",
    description:
      "Better specifications matter less than how much expertise a machine demands. We design for setup, calibration and everyday use, not just the spec sheet.",
  },
  {
    title: "Integrate sensing from the start",
    description:
      "Machines that can measure their own state can guide their operators and automate the tedious parts. Sensing is part of the architecture, not an accessory.",
  },
  {
    title: "One platform across machines",
    description:
      "Shared software, interfaces and conventions let each new machine build on the last, and let users carry what they learn between them.",
  },
  {
    title: "Say what is validated",
    description:
      "We publish what we have demonstrated and label everything else as an objective. Development status is stated plainly on every product page.",
  },
] as const

export const platformPillars = [
  {
    title: "Control",
    description: "Machine control designed together with the hardware it runs, rather than adapted to it afterwards.",
  },
  {
    title: "Sensing",
    description: "Measurement and imaging that give software an accurate picture of the machine, the work and the environment.",
  },
  {
    title: "Automation",
    description: "Routine steps such as setup, calibration and tool management handled by the system where it can do them reliably.",
  },
  {
    title: "AI-native workflows",
    description: "Interfaces designed around assistance and automation from the outset, so complex machines become approachable.",
  },
] as const
