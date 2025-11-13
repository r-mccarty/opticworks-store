import { Metadata } from "next"
import { CartPage } from "@/components/store/CartPage"

export const metadata: Metadata = {
  title: "Cart - OpticWorks Window Tinting",
  description: "Review your window tinting order and proceed to checkout.",
}

export default function Cart() {
  return <CartPage />
}