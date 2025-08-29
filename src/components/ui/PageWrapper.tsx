"use client"

import { usePathname } from 'next/navigation'
import { MenuBar } from '@/components/menu-bar'
import Footer from '@/components/ui/Footer'

export default function PageWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const isLandingPage = pathname === '/'

    const mainContainerClass = !isLandingPage ? "mx-auto max-w-6xl px-4" : ""

    return (
        <>
            <MenuBar isLandingPage={isLandingPage} />
            <main className={mainContainerClass}>{children}</main>
            <Footer isLandingPage={isLandingPage} />
        </>
    )
}
