import { Metadata } from "next"
import { CartPage } from "@/components/store/CartPage"

export const metadata: Metadata = {
  title: "Cart - OpticWorks Presence Sensors",
  description: "Review your OpticWorks presence hardware and complete checkout.",
}

export default function Cart() {
  return <CartPage />
}
