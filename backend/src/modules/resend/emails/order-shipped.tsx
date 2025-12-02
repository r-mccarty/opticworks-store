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
  Button,
  Preview,
} from "@react-email/components"

interface OrderShippedEmailProps {
  id?: string
  display_id?: string | number
  customer?: {
    first_name?: string
    last_name?: string
  }
  fulfillment?: {
    tracking_number?: string
    tracking_url?: string
    carrier?: string
  }
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
  items?: Array<{
    id: string
    title?: string
    product_title?: string
    variant_title?: string
    quantity: number
  }>
}

export function OrderShippedEmail(props: OrderShippedEmailProps): React.ReactElement {
  const {
    display_id,
    customer,
    fulfillment,
    shipping_address,
    items = [],
  } = props

  const customerName = customer?.first_name || "Customer"
  const orderNumber = display_id || "N/A"

  return (
    <Html>
      <Head />
      <Preview>{`Your order #${orderNumber} has shipped!`}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>OpticWorks</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>Your Order Has Shipped!</Heading>
            <Text style={textStyle}>
              Hi {customerName}, great news! Your order #{orderNumber} is on its way.
            </Text>

            {/* Tracking Info */}
            {fulfillment && (
              <Section style={trackingSectionStyle}>
                <Heading as="h3" style={subheadingStyle}>
                  Tracking Information
                </Heading>
                {fulfillment.carrier && (
                  <Text style={trackingDetailStyle}>
                    <strong>Carrier:</strong> {fulfillment.carrier}
                  </Text>
                )}
                {fulfillment.tracking_number && (
                  <Text style={trackingDetailStyle}>
                    <strong>Tracking Number:</strong> {fulfillment.tracking_number}
                  </Text>
                )}
                {fulfillment.tracking_url && (
                  <Button href={fulfillment.tracking_url} style={buttonStyle}>
                    Track Your Package
                  </Button>
                )}
              </Section>
            )}

            <Hr style={hrStyle} />

            {/* Items Shipped */}
            <Section style={itemsSectionStyle}>
              <Heading as="h3" style={subheadingStyle}>
                Items in This Shipment
              </Heading>
              {items.map((item) => (
                <Row key={item.id} style={itemRowStyle}>
                  <Column>
                    <Text style={itemNameStyle}>
                      {item.product_title || item.title}
                      {item.variant_title && (
                        <span style={variantStyle}> - {item.variant_title}</span>
                      )}
                    </Text>
                    <Text style={itemQuantityStyle}>Qty: {item.quantity}</Text>
                  </Column>
                </Row>
              ))}
            </Section>

            {/* Shipping Address */}
            {shipping_address && (
              <Section style={addressSectionStyle}>
                <Heading as="h3" style={subheadingStyle}>
                  Shipping To
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
              Questions about your shipment?{" "}
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

const trackingSectionStyle: React.CSSProperties = {
  backgroundColor: "#ecfdf5",
  borderRadius: "8px",
  marginBottom: "24px",
  padding: "20px",
}

const trackingDetailStyle: React.CSSProperties = {
  color: "#065f46",
  fontSize: "14px",
  margin: "0 0 8px 0",
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#059669",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: "600",
  marginTop: "12px",
  padding: "12px 24px",
  textDecoration: "none",
}

const hrStyle: React.CSSProperties = {
  borderColor: "#e4e4e7",
  margin: "24px 0",
}

const itemsSectionStyle: React.CSSProperties = {
  marginBottom: "24px",
}

const itemRowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e4e4e7",
  padding: "12px 0",
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

export default OrderShippedEmail
