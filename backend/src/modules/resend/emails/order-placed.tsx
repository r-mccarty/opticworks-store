import * as React from "react"
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Row,
  Column,
  Hr,
  Link,
  Preview,
} from "@react-email/components"

// Medusa v2 uses BigNumber objects for prices, which have {numeric_, raw_, bignumber_} shape
type BigNumberLike = { numeric_?: number; raw_?: string; bignumber_?: unknown } | number | undefined

interface OrderItem {
  id: string
  title?: string
  product_title?: string
  variant_title?: string
  quantity: number | BigNumberLike
  unit_price: number | BigNumberLike
  total: number | BigNumberLike
}

interface OrderPlacedEmailProps {
  id?: string
  display_id?: string | number
  email?: string
  customer?: {
    first_name?: string
    last_name?: string
  }
  items?: OrderItem[]
  shipping_address?: {
    first_name?: string
    last_name?: string
    address_1?: string
    address_2?: string
    city?: string
    province?: string
    postal_code?: string
    country_code?: string
  }
  subtotal?: number
  shipping_total?: number
  tax_total?: number
  total?: number
  currency_code?: string
}

// Medusa v2 stores prices in MAJOR units (dollars), not minor units (cents)
// See: https://docs.medusajs.com/learn/introduction/from-v1-to-v2#prices-are-stored-in-major-units

const toNumber = (value: BigNumberLike): number => {
  if (value === undefined || value === null) return 0
  if (typeof value === "number") return value
  // Handle Medusa BigNumber objects
  if (typeof value === "object" && "numeric_" in value && value.numeric_ !== undefined) {
    return value.numeric_
  }
  return 0
}

const formatCurrency = (amount: BigNumberLike, currency: string = "USD") => {
  const numericAmount = toNumber(amount)
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(numericAmount)
}

export function OrderPlacedEmail(props: OrderPlacedEmailProps): React.ReactElement {
  const {
    display_id,
    customer,
    items = [],
    shipping_address,
    subtotal,
    shipping_total,
    tax_total,
    total,
    currency_code = "USD",
  } = props

  const customerName = customer?.first_name || "Customer"
  const orderNumber = display_id || "N/A"

  return (
    <Html>
      <Head />
      <Preview>{`Order Confirmation - #${orderNumber}`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>OpticWorks</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>Order Confirmed!</Heading>
            <Text style={textStyle}>
              Hi {customerName}, thank you for your order. We&apos;re getting it ready
              and will notify you when it ships.
            </Text>

            <Text style={orderNumberStyle}>Order #{orderNumber}</Text>

            {/* Order Items */}
            <Section style={itemsSectionStyle}>
              <Heading as="h3" style={subheadingStyle}>
                Order Summary
              </Heading>
              {items.map((item) => (
                <Row key={item.id} style={itemRowStyle}>
                  <Column style={itemNameColumnStyle}>
                    <Text style={itemNameStyle}>
                      {item.product_title || item.title}
                      {item.variant_title && (
                        <span style={variantStyle}> - {item.variant_title}</span>
                      )}
                    </Text>
                    <Text style={itemQuantityStyle}>Qty: {toNumber(item.quantity)}</Text>
                  </Column>
                  <Column style={itemPriceColumnStyle}>
                    <Text style={itemPriceStyle}>
                      {formatCurrency(item.total, currency_code)}
                    </Text>
                  </Column>
                </Row>
              ))}
            </Section>

            <Hr style={hrStyle} />

            {/* Order Totals */}
            <Section style={totalsStyle}>
              <Row style={totalRowStyle}>
                <Column>
                  <Text style={totalLabelStyle}>Subtotal</Text>
                </Column>
                <Column style={totalValueColumnStyle}>
                  <Text style={totalValueStyle}>
                    {formatCurrency(subtotal, currency_code)}
                  </Text>
                </Column>
              </Row>
              <Row style={totalRowStyle}>
                <Column>
                  <Text style={totalLabelStyle}>Shipping</Text>
                </Column>
                <Column style={totalValueColumnStyle}>
                  <Text style={totalValueStyle}>
                    {formatCurrency(shipping_total, currency_code)}
                  </Text>
                </Column>
              </Row>
              <Row style={totalRowStyle}>
                <Column>
                  <Text style={totalLabelStyle}>Tax</Text>
                </Column>
                <Column style={totalValueColumnStyle}>
                  <Text style={totalValueStyle}>
                    {formatCurrency(tax_total, currency_code)}
                  </Text>
                </Column>
              </Row>
              <Hr style={hrStyle} />
              <Row style={totalRowStyle}>
                <Column>
                  <Text style={grandTotalLabelStyle}>Total</Text>
                </Column>
                <Column style={totalValueColumnStyle}>
                  <Text style={grandTotalValueStyle}>
                    {formatCurrency(total, currency_code)}
                  </Text>
                </Column>
              </Row>
            </Section>

            {/* Shipping Address */}
            {shipping_address && (
              <Section style={addressSectionStyle}>
                <Heading as="h3" style={subheadingStyle}>
                  Shipping Address
                </Heading>
                <Text style={addressStyle}>
                  {shipping_address.first_name} {shipping_address.last_name}
                  <br />
                  {shipping_address.address_1}
                  {shipping_address.address_2 && (
                    <>
                      <br />
                      {shipping_address.address_2}
                    </>
                  )}
                  <br />
                  {shipping_address.city}, {shipping_address.province}{" "}
                  {shipping_address.postal_code}
                  <br />
                  {shipping_address.country_code?.toUpperCase()}
                </Text>
              </Section>
            )}
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Questions about your order?{" "}
              <Link href="https://optic.works/support" style={linkStyle}>
                Contact Support
              </Link>
            </Text>
            <Text style={footerCopyrightStyle}>
              &copy; {new Date().getFullYear()} OpticWorks. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// Styles
const bodyStyle: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: 0,
  padding: "40px 0",
}

const containerStyle: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden",
}

const headerStyle: React.CSSProperties = {
  backgroundColor: "#18181b",
  padding: "24px",
  textAlign: "center" as const,
}

const logoStyle: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "bold",
  margin: 0,
}

const contentStyle: React.CSSProperties = {
  padding: "32px 24px",
}

const headingStyle: React.CSSProperties = {
  color: "#18181b",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
}

const subheadingStyle: React.CSSProperties = {
  color: "#18181b",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 12px 0",
}

const textStyle: React.CSSProperties = {
  color: "#52525b",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
}

const orderNumberStyle: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  borderRadius: "4px",
  color: "#18181b",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 24px 0",
  padding: "8px 16px",
}

const itemsSectionStyle: React.CSSProperties = {
  marginBottom: "24px",
}

const itemRowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e4e4e7",
  padding: "12px 0",
}

const itemNameColumnStyle: React.CSSProperties = {
  width: "70%",
}

const itemPriceColumnStyle: React.CSSProperties = {
  textAlign: "right" as const,
  width: "30%",
}

const itemNameStyle: React.CSSProperties = {
  color: "#18181b",
  fontSize: "14px",
  fontWeight: "500",
  margin: 0,
}

const variantStyle: React.CSSProperties = {
  color: "#71717a",
  fontWeight: "normal",
}

const itemQuantityStyle: React.CSSProperties = {
  color: "#71717a",
  fontSize: "12px",
  margin: "4px 0 0 0",
}

const itemPriceStyle: React.CSSProperties = {
  color: "#18181b",
  fontSize: "14px",
  margin: 0,
}

const hrStyle: React.CSSProperties = {
  borderColor: "#e4e4e7",
  margin: "16px 0",
}

const totalsStyle: React.CSSProperties = {
  marginBottom: "24px",
}

const totalRowStyle: React.CSSProperties = {
  marginBottom: "8px",
}

const totalLabelStyle: React.CSSProperties = {
  color: "#71717a",
  fontSize: "14px",
  margin: 0,
}

const totalValueColumnStyle: React.CSSProperties = {
  textAlign: "right" as const,
}

const totalValueStyle: React.CSSProperties = {
  color: "#18181b",
  fontSize: "14px",
  margin: 0,
}

const grandTotalLabelStyle: React.CSSProperties = {
  color: "#18181b",
  fontSize: "16px",
  fontWeight: "600",
  margin: 0,
}

const grandTotalValueStyle: React.CSSProperties = {
  color: "#18181b",
  fontSize: "16px",
  fontWeight: "600",
  margin: 0,
}

const addressSectionStyle: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  borderRadius: "4px",
  padding: "16px",
}

const addressStyle: React.CSSProperties = {
  color: "#52525b",
  fontSize: "14px",
  lineHeight: "20px",
  margin: 0,
}

const footerStyle: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  padding: "24px",
  textAlign: "center" as const,
}

const footerTextStyle: React.CSSProperties = {
  color: "#71717a",
  fontSize: "14px",
  margin: "0 0 8px 0",
}

const linkStyle: React.CSSProperties = {
  color: "#2563eb",
  textDecoration: "none",
}

const footerCopyrightStyle: React.CSSProperties = {
  color: "#a1a1aa",
  fontSize: "12px",
  margin: 0,
}

export default OrderPlacedEmail
