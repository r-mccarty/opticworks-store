"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  BookOpen,
  Compass,
  GitBranch,
  Home,
  Info,
  Menu,
  RadioReceiver,
  Scale,
  Sparkles,
  Users,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/app/siteConfig"
import { cx } from "@/lib/utils"
import useScroll from "@/lib/useScroll"
import { SolarLogo } from "../../public/SolarLogo"

type NavigationItem = {
  icon: React.ReactNode
  label: string
  href: string
  gradient: string
}

const navigation: NavigationItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Home",
    href: siteConfig.baseLinks.home,
    gradient:
      "radial-gradient(circle, rgba(56,189,248,0.15) 0%, rgba(14,165,233,0.06) 50%, rgba(2,132,199,0) 100%)",
  },
  {
    icon: <RadioReceiver className="h-5 w-5" />,
    label: "How it works",
    href: siteConfig.baseLinks.howItWorks,
    gradient:
      "radial-gradient(circle, rgba(129,140,248,0.15) 0%, rgba(99,102,241,0.06) 50%, rgba(67,56,202,0) 100%)",
  },
  {
    icon: <Sparkles className="h-5 w-5" />,
    label: "Features",
    href: siteConfig.baseLinks.features,
    gradient:
      "radial-gradient(circle, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.06) 50%, rgba(4,120,87,0) 100%)",
  },
  {
    icon: <Compass className="h-5 w-5" />,
    label: "Getting started",
    href: siteConfig.baseLinks.gettingStarted,
    gradient:
      "radial-gradient(circle, rgba(251,191,36,0.2) 0%, rgba(245,158,11,0.08) 50%, rgba(217,119,6,0) 100%)",
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: "Documentation",
    href: siteConfig.baseLinks.documentation,
    gradient:
      "radial-gradient(circle, rgba(129,199,245,0.2) 0%, rgba(79,154,219,0.08) 50%, rgba(37,99,235,0) 100%)",
  },
  {
    icon: <Scale className="h-5 w-5" />,
    label: "Comparison",
    href: siteConfig.baseLinks.comparison,
    gradient:
      "radial-gradient(circle, rgba(244,114,182,0.18) 0%, rgba(236,72,153,0.08) 50%, rgba(219,39,119,0) 100%)",
  },
  {
    icon: <Users className="h-5 w-5" />,
    label: "Community",
    href: siteConfig.baseLinks.community,
    gradient:
      "radial-gradient(circle, rgba(251,146,60,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
  },
  {
    icon: <Info className="h-5 w-5" />,
    label: "About",
    href: siteConfig.baseLinks.about,
    gradient:
      "radial-gradient(circle, rgba(148,163,184,0.18) 0%, rgba(100,116,139,0.08) 50%, rgba(71,85,105,0) 100%)",
  },
]

const itemVariants = {
  initial: { y: 0, opacity: 1 },
  hover: { y: -2, opacity: 0.95 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 1 },
  hover: { opacity: 0.8, scale: 1.05 },
}

const transition = {
  type: "tween" as const,
  duration: 0.18,
  ease: "easeOut" as const,
}

const lightRoutes = Object.values(siteConfig.baseLinks)

export const MenuBar = React.memo(function MenuBar() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)
  const scrolled = useScroll(15)
  const pathname = usePathname()

  const isLightPage = React.useMemo(() => {
    return lightRoutes.some((route) => pathname.startsWith(route))
  }, [pathname])

  React.useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 mx-auto flex max-w-full justify-center transition-all duration-300",
        scrolled ? "p-4" : "p-6",
      )}
    >
      <nav
        className={cx(
          "relative w-full max-w-6xl rounded-2xl border border-transparent p-3 transition-all duration-300",
          scrolled ? "bg-white/90 border-slate-200/60 shadow-lg" : "bg-transparent",
        )}
      >
        <div className="relative flex items-center justify-between">
          <Link href={siteConfig.baseLinks.home} aria-label="Home" className="flex-shrink-0">
            <SolarLogo
              className={cx(
                "w-20 transition-colors duration-300",
                scrolled || isLightPage ? "text-slate-900" : "text-white",
              )}
            />
          </Link>
          <div className="hidden items-center gap-1 lg:flex">
            {navigation.map((item) => (
              <motion.div key={item.label} className="relative group">
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-xl"
                  variants={glowVariants}
                  initial="initial"
                  whileHover="hover"
                  transition={transition}
                  style={{ background: item.gradient, opacity: 0 }}
                />
                <motion.div
                  className="relative"
                  variants={itemVariants}
                  initial="initial"
                  whileHover="hover"
                  transition={transition}
                >
                  <Link
                    href={item.href}
                    className={cx(
                      "flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors duration-300",
                      scrolled || isLightPage
                        ? "text-slate-700 hover:text-slate-900"
                        : "text-white hover:text-slate-200",
                    )}
                  >
                    <span className="text-slate-500">{item.icon}</span>
                    <span className="hidden xl:block">{item.label}</span>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className={cx(
                "flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 lg:hidden",
                scrolled || isLightPage ? "bg-slate-100 hover:bg-slate-200" : "bg-white/10 hover:bg-white/20",
              )}
            >
              {mobileMenuOpen ? (
                <X className={cx("h-5 w-5", scrolled || isLightPage ? "text-slate-700" : "text-white")} />
              ) : (
                <Menu className={cx("h-5 w-5", scrolled || isLightPage ? "text-slate-700" : "text-white")} />
              )}
            </motion.button>
            <motion.a
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              href={siteConfig.external.github}
              target="_blank"
              rel="noopener noreferrer"
              className={cx(
                "hidden rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] lg:inline-flex",
                scrolled || isLightPage
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "bg-white text-slate-900 hover:bg-slate-100",
              )}
            >
              <GitBranch className="mr-2 h-4 w-4" /> GitHub
            </motion.a>
            <motion.div whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
              <Link
                href={siteConfig.baseLinks.gettingStarted}
                className="hidden rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-indigo-500 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-slate-950 shadow-md shadow-cyan-500/30 transition hover:from-cyan-300 hover:via-sky-400 hover:to-indigo-400 lg:inline-flex"
              >
                Start building
              </Link>
            </motion.div>
          </div>
        </div>
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={transition}
              className={cx(
                "mt-4 flex flex-col gap-2 rounded-xl border p-4 lg:hidden",
                scrolled || isLightPage
                  ? "border-slate-200/60 bg-white/90"
                  : "border-slate-700/60 bg-slate-900/90",
              )}
            >
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cx(
                    "rounded-xl px-4 py-2 text-sm font-medium transition-colors",
                    scrolled || isLightPage
                      ? "text-slate-700 hover:bg-slate-100"
                      : "text-white hover:bg-white/10",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={siteConfig.baseLinks.gettingStarted}
                className={cx(
                  "rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em]",
                  scrolled || isLightPage
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-900",
                )}
              >
                Start building
              </Link>
              <Link
                href={siteConfig.external.github}
                target="_blank"
                rel="noopener noreferrer"
                className={cx(
                  "rounded-xl px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em]",
                  scrolled || isLightPage
                    ? "border border-slate-200 bg-white"
                    : "border border-white/20 bg-white/10 text-white",
                )}
              >
                GitHub repository
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
})
