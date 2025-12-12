"use client"

import * as React from "react"
import { AnimatePresence, motion } from "framer-motion"
import {
  BookOpen,
  FileText,
  Headphones,
  Home,
  Menu,
  Package,
  ShoppingCart,
  Store,
  UserCircle,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/app/siteConfig"
import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { cx } from "@/lib/utils"
import useScroll from "@/lib/useScroll"
import { SolarLogo } from "../../public/SolarLogo"

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  external?: boolean
}

const menuItems: MenuItem[] = [
  { icon: <Home className="size-4" />, label: "Home", href: siteConfig.baseLinks.home },
  { icon: <Package className="size-4" />, label: "Products", href: "/products" },
  { icon: <Store className="size-4" />, label: "Store", href: "/store" },
  { icon: <Headphones className="size-4" />, label: "Support", href: siteConfig.baseLinks.support },
  { icon: <BookOpen className="size-4" />, label: "Guides", href: "/install-guides" },
  { icon: <FileText className="size-4" />, label: "Docs", href: "https://docs.optic.works", external: true },
]

const panelTransition = {
  type: "tween" as const,
  duration: 0.18,
  ease: "easeOut" as const,
}

const itemVariants = {
  initial: { y: 0, opacity: 1 },
  hover: { y: -1, opacity: 0.96 },
}

export const MenuBar = React.memo(function MenuBar() {
  const pathname = usePathname()
  const scrolled = useScroll(8)

  const totalItems = useCart(
    (state) => state.items.reduce((total, item) => total + item.quantity, 0)
  )
  const { isAuthenticated, customer } = useAuth()

  const [mounted, setMounted] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const totalItemsCount = mounted ? totalItems : 0
  const accountHref = mounted && isAuthenticated ? "/account" : "/auth/login"
  const accountLabel =
    mounted && isAuthenticated ? customer?.first_name || "Account" : "Sign in"

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div
        className={cx(
          "mx-auto flex max-w-6xl px-4 transition-all",
          scrolled ? "pt-3" : "pt-5"
        )}
      >
        <nav
          className={cx(
            "relative flex w-full items-center justify-between rounded-xl border px-3 py-2 backdrop-blur-md transition-colors",
            scrolled
              ? "bg-card/80 border-border shadow-elevation-2"
              : "bg-transparent border-transparent"
          )}
        >
          <Link
            href={siteConfig.baseLinks.home}
            aria-label="Home"
            className="flex items-center gap-2"
          >
            <SolarLogo className="w-20 text-foreground" />
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {menuItems.map((item) => {
              const isActive =
                item.href !== "/" && pathname.startsWith(item.href)

              return (
                <motion.div
                  key={item.label}
                  variants={itemVariants}
                  initial="initial"
                  whileHover="hover"
                  transition={panelTransition}
                >
                  <Link
                    href={item.href}
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    className={cx(
                      "nav-link inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <span className="nav-icon text-muted-foreground">
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={
                mobileMenuOpen
                  ? "Close navigation menu"
                  : "Open navigation menu"
              }
              className="flex size-10 items-center justify-center rounded-lg bg-muted/60 transition-colors hover:bg-muted lg:hidden"
            >
              {mobileMenuOpen ? (
                <X className="size-5 text-foreground" />
              ) : (
                <Menu className="size-5 text-foreground" />
              )}
            </motion.button>

            <Link
              href={accountHref}
              title={accountLabel}
              className="flex size-10 items-center justify-center rounded-lg bg-muted/60 transition-colors hover:bg-muted"
            >
              <UserCircle className="size-5 text-foreground" />
            </Link>

            <Link
              href="/store/cart"
              className="relative flex size-10 items-center justify-center rounded-lg bg-muted/60 transition-colors hover:bg-muted"
            >
              <ShoppingCart className="size-5 text-foreground" />
              {totalItemsCount > 0 && (
                <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground shadow-elevation-1">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            <Link
              href="/store"
              className="hidden items-center rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-elevation-1 transition-colors hover:bg-primary/90 sm:inline-flex"
            >
              Shop
            </Link>
          </div>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={panelTransition}
                className="absolute left-0 right-0 top-full mt-3 flex flex-col gap-1 rounded-xl border border-border bg-card/95 p-2 shadow-elevation-2 lg:hidden"
              >
                {menuItems.map((item) => {
                  const isActive =
                    item.href !== "/" && pathname.startsWith(item.href)

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cx(
                        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <span className="text-muted-foreground">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  )
                })}

                <Link
                  href={accountHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                >
                  <UserCircle className="size-4" />
                  {accountLabel}
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    </header>
  )
})

