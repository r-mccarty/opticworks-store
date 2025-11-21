"use client"

import { siteConfig } from "@/app/siteConfig"
import useScroll from "@/lib/useScroll"
import { cx } from "@/lib/utils"
import { RiCloseFill, RiMenuFill } from "@remixicon/react"
import { ShoppingCartIcon } from "@heroicons/react/24/outline"
import Link from "next/link"
import React from "react"
import { SolarLogo } from "../../../public/SolarLogo"
import { Button } from "../Button"
import { useCart } from "@/hooks/useCart"

export function NavBar() {
  const [open, setOpen] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)
  const scrolled = useScroll(15)
  const totalItems = useCart(
    (state) => state.items.reduce((total, item) => total + item.quantity, 0)
  )

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header
      className={cx(
        "fixed inset-x-4 top-4 z-50 mx-auto flex max-w-5xl justify-center rounded-full px-6 py-3 transition-all duration-300",
        scrolled || open
          ? "glass-card shadow-2xl shadow-black/20"
          : "bg-transparent border border-white/5",
      )}
    >
      <div className="w-full md:my-auto">
        <div className="relative flex items-center justify-between">
          <Link href={siteConfig.baseLinks.home} aria-label="Home">
            <span className="sr-only">OpticWorks Logo</span>
            <SolarLogo className="w-22" />
          </Link>
          <nav className="hidden sm:block md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
            <div className="flex items-center gap-8 font-mono text-xs uppercase tracking-wider">
              <Link className="px-3 py-1.5 text-white/70 hover:text-amber-400 transition-colors" href="/products">
                Products
              </Link>
              <Link className="px-3 py-1.5 text-white/70 hover:text-amber-400 transition-colors" href="/store">
                Store
              </Link>
              <Link className="px-3 py-1.5 text-white/70 hover:text-amber-400 transition-colors" href={siteConfig.baseLinks.support}>
                Support
              </Link>
              <Link className="px-3 py-1.5 text-white/70 hover:text-amber-400 transition-colors" href="/install-guides">
                Guides
              </Link>
            </div>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="relative p-2 text-white/70 hover:text-amber-400"
            >
              <Link href="/store/cart">
                <ShoppingCartIcon className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-cyber-black font-mono text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="h-9 font-mono text-xs uppercase tracking-wider bg-white/10 text-white hover:bg-amber-500 hover:text-cyber-black transition-all rounded-full"
            >
              <Link href="/store">Shop Now</Link>
            </Button>
          </div>
          <Button
            onClick={() => setOpen(!open)}
            variant="secondary"
            className="p-1.5 sm:hidden bg-white/10 text-white hover:bg-amber-500 hover:text-cyber-black"
            aria-label={open ? "CloseNavigation Menu" : "Open Navigation Menu"}
          >
            {!open ? (
              <RiMenuFill
                className="size-6 shrink-0"
                aria-hidden
              />
            ) : (
              <RiCloseFill
                className="size-6 shrink-0"
                aria-hidden
              />
            )}
          </Button>
        </div>
        <nav
          className={cx(
            "mt-6 flex flex-col gap-6 text-lg ease-in-out will-change-transform sm:hidden",
            open ? "" : "hidden",
          )}
        >
          <ul className="space-y-4 font-mono text-sm uppercase tracking-wider">
            <li onClick={() => setOpen(false)}>
              <Link href="/products" className="text-white/70 hover:text-amber-400 transition-colors">Products</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href="/store" className="text-white/70 hover:text-amber-400 transition-colors">Store</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.support} className="text-white/70 hover:text-amber-400 transition-colors">Support</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href="/install-guides" className="text-white/70 hover:text-amber-400 transition-colors">Guides</Link>
            </li>
          </ul>
          <Button asChild variant="secondary" className="text-sm font-mono uppercase bg-white/10 text-white hover:bg-amber-500 hover:text-cyber-black rounded-full">
            <Link href="/store">Shop Now</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
