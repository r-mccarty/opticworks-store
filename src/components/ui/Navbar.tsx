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
        "fixed inset-x-4 top-4 z-50 mx-auto flex max-w-6xl justify-center rounded-lg border border-transparent px-3 py-3 transition duration-300",
        scrolled || open
          ? "border-gray-200/50 bg-white/80 shadow-2xl shadow-black/5 backdrop-blur-sm"
          : "bg-white/0",
      )}
    >
      <div className="w-full md:my-auto">
        <div className="relative flex items-center justify-between">
          <Link href={siteConfig.baseLinks.home} aria-label="Home">
            <span className="sr-only">OpticWorks Logo</span>
            <SolarLogo className="w-22" />
          </Link>
          <nav className="hidden sm:block md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:transform">
            <div className="flex items-center gap-10 font-bold">
              <Link className="px-2 py-1 text-gray-900 hover:text-orange-600 transition-colors" href="/products">
                Products
              </Link>
              <Link className="px-2 py-1 text-gray-900 hover:text-orange-600 transition-colors" href="/store">
                Store
              </Link>
              <Link className="px-2 py-1 text-gray-900 hover:text-orange-600 transition-colors" href={siteConfig.baseLinks.support}>
                Customer Support
              </Link>
              <Link className="px-2 py-1 text-gray-900 hover:text-orange-600 transition-colors" href="/install-guides">
                Install Guides
              </Link>
            </div>
          </nav>
          <div className="hidden sm:flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="relative p-2"
            >
              <Link href="/store/cart">
                <ShoppingCartIcon className="w-5 h-5" />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="h-10 font-medium"
            >
              <Link href="/store">Shop Now</Link>
            </Button>
          </div>
          <Button
            onClick={() => setOpen(!open)}
            variant="secondary"
            className="p-1.5 sm:hidden"
            aria-label={open ? "CloseNavigation Menu" : "Open Navigation Menu"}
          >
            {!open ? (
              <RiMenuFill
                className="size-6 shrink-0 text-gray-900"
                aria-hidden
              />
            ) : (
              <RiCloseFill
                className="size-6 shrink-0 text-gray-900"
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
          <ul className="space-y-4 font-bold">
            <li onClick={() => setOpen(false)}>
              <Link href="/products" className="hover:text-orange-600 transition-colors">Products</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href="/store" className="hover:text-orange-600 transition-colors">Store</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href={siteConfig.baseLinks.support} className="hover:text-orange-600 transition-colors">Customer Support</Link>
            </li>
            <li onClick={() => setOpen(false)}>
              <Link href="/install-guides" className="hover:text-orange-600 transition-colors">Install Guides</Link>
            </li>
          </ul>
          <Button asChild variant="secondary" className="text-lg">
            <Link href="/store">Shop Now</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
