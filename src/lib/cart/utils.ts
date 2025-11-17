import type { Product, ProductSpecification } from "@/lib/products"
import type { CartItem } from "./types"

const isValidSpecification = (spec?: ProductSpecification | null): spec is ProductSpecification => {
  return Boolean(
    spec &&
      typeof spec.label === "string" &&
      spec.label.trim().length > 0 &&
      typeof spec.value === "string" &&
      spec.value.trim().length > 0,
  )
}

export const ensureSpecifications = (specs?: ProductSpecification[] | null): ProductSpecification[] => {
  if (!Array.isArray(specs)) {
    return []
  }

  return specs.filter(isValidSpecification)
}

export const normalizeCartItem = (item: Product | CartItem, quantityOverride?: number): CartItem => {
  const quantityFromItem = (item as CartItem).quantity
  const normalizedQuantity =
    typeof quantityOverride === "number"
      ? quantityOverride
      : typeof quantityFromItem === "number"
        ? quantityFromItem
        : 1

  return {
    ...item,
    quantity: Math.max(1, normalizedQuantity),
    specifications: ensureSpecifications(item.specifications),
  }
}

export const normalizeCartItems = (items?: Array<Product | CartItem> | null): CartItem[] => {
  if (!Array.isArray(items)) {
    return []
  }

  return items.map((item) => normalizeCartItem(item as CartItem))
}

export const summarizeSpecifications = (
  specs?: ProductSpecification[] | null,
  limit = 2,
  separator = " • ",
): string => {
  const normalized = ensureSpecifications(specs).slice(0, limit)
  if (!normalized.length) {
    return ""
  }

  return normalized.map((spec) => `${spec.label}: ${spec.value}`).join(separator)
}
