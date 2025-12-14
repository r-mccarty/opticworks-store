"use client"

import * as React from "react"
import { Menu, ShoppingBag, X } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { useAuth } from "@/hooks/useAuth"
import { useCart } from "@/hooks/useCart"
import { cx } from "@/lib/utils"
import useScroll from "@/lib/useScroll"

const navItems = [
  { label: "Technology", href: "#technology" },
  { label: "Privacy", href: "#privacy" },
  { label: "Specs", href: "#specs" },
  { label: "Integrations", href: "#integrations" },
] as const

export const MenuBar = React.memo(function MenuBar() {
  const pathname = usePathname()
  const router = useRouter()
  const scrolled = useScroll(20)

  const totalItems = useCart(
    (state) => state.items.reduce((total, item) => total + item.quantity, 0)
  )
  const { isAuthenticated, customer } = useAuth()

  const [mounted, setMounted] = React.useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  const totalItemsCount = mounted ? totalItems : 0
  const accountHref =
    mounted && isAuthenticated ? "/account" : "/auth/login"
  const accountLabel = mounted && isAuthenticated
    ? customer?.first_name || "Account"
    : "Log In"

  const handleLogoClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    router.push("/")
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNavClick = (href: string) => {
    if (pathname !== "/") {
      router.push(`/${href}`)
      setTimeout(() => {
        const element = document.querySelector(href)
        if (element) element.scrollIntoView({ behavior: "smooth" })
      }, 150)
      return
    }

    const element = document.querySelector(href)
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <nav
      className={cx(
        "fixed top-0 right-0 left-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-white/5 bg-black/80 py-4 backdrop-blur-md"
          : "bg-transparent py-6"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          onClick={handleLogoClick}
          className="group flex items-center gap-3"
          aria-label="OpticWorks Home"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-500 transition-transform group-hover:scale-105">
            <div className="h-4 w-4 rounded-full bg-black" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            OpticWorks
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleNavClick(item.href)}
              className="cursor-pointer border-none bg-transparent text-sm font-medium text-neutral-400 transition-colors hover:text-amber-500"
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href={accountHref}
            className="hidden px-5 py-2 text-sm font-medium text-amber-500 transition-colors hover:text-amber-400 md:block"
            title={accountLabel}
          >
            {accountLabel}
          </Link>

          <Link
            href="/store/cart"
            className="relative p-2 text-neutral-300 transition-colors hover:text-white"
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {totalItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black animate-in zoom-in">
                {totalItemsCount}
              </span>
            )}
          </Link>

          <Link
            href="/store"
            className="hidden rounded bg-amber-500 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-amber-400 md:block"
          >
            Pre-order OW-1
          </Link>

          <button
            type="button"
            className="text-white md:hidden"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="absolute top-full right-0 left-0 flex flex-col gap-4 border-b border-white/10 bg-neutral-900 p-6 md:hidden">
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                handleNavClick(item.href)
                setMobileMenuOpen(false)
              }}
              className="text-left text-lg font-medium text-neutral-300"
            >
              {item.label}
            </button>
          ))}
          <div className="my-2 h-px bg-white/10" />
          <Link
            href="/store"
            onClick={() => setMobileMenuOpen(false)}
            className="w-full rounded bg-amber-500 py-3 text-center font-medium text-black"
          >
            Pre-order OW-1
          </Link>
        </div>
      )}
    </nav>
  )
})
