"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { Home, Package, Store, Headphones, BookOpen, ShoppingCart } from "lucide-react"
import { useTheme } from "next-themes"
import Link from "next/link"
import { siteConfig } from "@/app/siteConfig"
import { useCart } from "@/hooks/useCart"
import { SolarLogo } from "../../public/SolarLogo"

interface MenuItem {
  icon: React.ReactNode
  label: string
  href: string
  gradient: string
  iconColor: string
}

const menuItems: MenuItem[] = [
  {
    icon: <Home className="h-5 w-5" />,
    label: "Home",
    href: siteConfig.baseLinks.home,
    gradient: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, rgba(37,99,235,0.06) 50%, rgba(29,78,216,0) 100%)",
    iconColor: "rgb(59 130 246)", // blue-500
  },
  {
    icon: <Package className="h-5 w-5" />,
    label: "Products",
    href: "/products",
    gradient: "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "rgb(249 115 22)", // orange-500
  },
  {
    icon: <Store className="h-5 w-5" />,
    label: "Store",
    href: "/store",
    gradient: "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "rgb(34 197 94)", // green-500
  },
  {
    icon: <Headphones className="h-5 w-5" />,
    label: "Support",
    href: siteConfig.baseLinks.support,
    gradient: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(147,51,234,0.06) 50%, rgba(124,58,237,0) 100%)",
    iconColor: "rgb(168 85 247)", // purple-500
  },
  {
    icon: <BookOpen className="h-5 w-5" />,
    label: "Install Guides",
    href: "/install-guides",
    gradient: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.06) 50%, rgba(185,28,28,0) 100%)",
    iconColor: "rgb(239 68 68)", // red-500
  },
]

// Simplified animations - 2D transforms only
const itemVariants = {
  initial: { y: 0, opacity: 1 },
  hover: { y: -2, opacity: 0.95 },
}

const glowVariants = {
  initial: { opacity: 0, scale: 1 },
  hover: { opacity: 0.8, scale: 1.05 },
}

const fastTransition = {
  type: "tween" as const,
  duration: 0.15,
  ease: "easeOut" as const,
}

import { cx } from "@/lib/utils"
import useScroll from "@/lib/useScroll"
import { usePathname } from "next/navigation"

const lightRoutes = ["/products", "/store", "/install-guides", "/support"]

export const MenuBar = React.memo(function MenuBar() {
  const { theme } = useTheme()
  const { getTotalItems } = useCart()
  const [mounted, setMounted] = React.useState(false)
  const scrolled = useScroll(15)
  const pathname = usePathname()

  const isLightPage = React.useMemo(() => {
    return lightRoutes.some((route) => pathname.startsWith(route))
  }, [pathname])

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Memoize expensive calculations
  const totalItems = React.useMemo(() => {
    return mounted ? getTotalItems() : 0
  }, [mounted, getTotalItems])

  // const isDarkTheme = theme === "dark" // Removed for now, not used in simplified version

  return (
    <header
      className={cx(
        "fixed inset-x-0 top-0 z-50 mx-auto flex max-w-full justify-center transition-all duration-300",
        scrolled ? "p-4" : "p-6",
      )}
    >
      <nav
        className={cx(
          "p-3 rounded-2xl relative w-full will-change-transform transition-all duration-300 max-w-6xl",
          scrolled || isLightPage
            ? "bg-white/90 border border-gray-200/50 shadow-lg"
            : "bg-transparent border-transparent",
        )}
      >
        <div className="flex items-center justify-between relative">
          {/* Logo */}
          <Link
            href={siteConfig.baseLinks.home}
            aria-label="Home"
            className="flex-shrink-0"
          >
            <SolarLogo
              className={cx(
                "w-20 transition-colors duration-300",
                scrolled || isLightPage ? "text-gray-900" : "text-white",
              )}
            />
          </Link>

          {/* Navigation Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {menuItems.map((item) => (
              <motion.div key={item.label} className="relative group">
                <motion.div
                  className="absolute inset-0 rounded-xl pointer-events-none will-change-transform"
                  variants={glowVariants}
                  initial="initial"
                  whileHover="hover"
                  transition={fastTransition}
                  style={{
                    background: item.gradient,
                    opacity: 0,
                  }}
                />
                <motion.div
                  className="relative"
                  variants={itemVariants}
                  initial="initial"
                  whileHover="hover"
                  transition={fastTransition}
                >
                  <Link
                    href={item.href}
                    className={cx(
                      "flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium will-change-transform nav-link transition-colors duration-300",
                      scrolled || isLightPage
                        ? "text-gray-700 hover:text-gray-900"
                        : "text-white hover:text-gray-200",
                    )}
                    style={
                      {
                        "--icon-color": item.iconColor,
                      } as React.CSSProperties
                    }
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="hidden xl:block">{item.label}</span>
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {/* Shopping Cart */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/store/cart"
                className={cx(
                  "flex items-center justify-center w-10 h-10 rounded-xl transition-colors duration-300",
                  scrolled || isLightPage
                    ? "bg-gray-100 hover:bg-gray-200"
                    : "bg-white/10 hover:bg-white/20",
                )}
              >
                <ShoppingCart
                  className={cx(
                    "w-5 h-5 transition-colors duration-300",
                    scrolled || isLightPage ? "text-gray-700" : "text-white",
                  )}
                />
                {mounted && totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {totalItems}
                  </span>
                )}
              </Link>
            </motion.div>

            {/* Shop Now Button */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <Link
                href="/store"
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium text-sm transition-colors"
              >
                Shop Now
              </Link>
            </motion.div>
          </div>
        </div>
      </nav>
    </header>
  )
})
