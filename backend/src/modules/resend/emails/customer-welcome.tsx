import * as React from "react"
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
  Preview,
} from "@react-email/components"

interface CustomerWelcomeEmailProps {
  id?: string
  email?: string
  first_name?: string
  last_name?: string
}

export function CustomerWelcomeEmail(props: CustomerWelcomeEmailProps): React.ReactElement {
  const { first_name } = props

  const customerName = first_name || "there"

  return (
    <Html>
      <Head />
      <Preview>Welcome to OpticWorks - Your account is ready!</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>OpticWorks</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>Welcome to OpticWorks!</Heading>
            <Text style={textStyle}>
              Hi {customerName}, thanks for creating an account with us. We&apos;re excited
              to have you as part of our community.
            </Text>

            <Text style={textStyle}>
              With your new account, you can:
            </Text>

            <Section style={benefitsStyle}>
              <Text style={benefitItemStyle}>
                <span style={checkmarkStyle}>&#10003;</span> Track your orders in real-time
              </Text>
              <Text style={benefitItemStyle}>
                <span style={checkmarkStyle}>&#10003;</span> Save your shipping addresses
              </Text>
              <Text style={benefitItemStyle}>
                <span style={checkmarkStyle}>&#10003;</span> View your order history
              </Text>
              <Text style={benefitItemStyle}>
                <span style={checkmarkStyle}>&#10003;</span> Get faster checkout on future purchases
              </Text>
            </Section>

            <Section style={ctaSectionStyle}>
              <Button href="https://optic.works/store" style={buttonStyle}>
                Start Shopping
              </Button>
            </Section>

            <Hr style={hrStyle} />

            <Section style={productHighlightStyle}>
              <Heading as="h3" style={subheadingStyle}>
                Featured Product
              </Heading>
              <Text style={productNameStyle}>Bed Presence Sensor Kit</Text>
              <Text style={productDescStyle}>
                Our flagship sleep tracking sensor that monitors your sleep patterns
                without wearing anything to bed.
              </Text>
              <Link href="https://optic.works/products/bed-presence-sensor-kit" style={productLinkStyle}>
                Learn More &rarr;
              </Link>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Questions?{" "}
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
  margin: "0 0 16px 0",
}

const benefitsStyle: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  borderRadius: "8px",
  padding: "16px 24px",
  marginBottom: "24px",
}

const benefitItemStyle: React.CSSProperties = {
  color: "#18181b",
  fontSize: "14px",
  lineHeight: "28px",
  margin: 0,
}

const checkmarkStyle: React.CSSProperties = {
  color: "#22c55e",
  fontWeight: "bold",
  marginRight: "8px",
}

const ctaSectionStyle: React.CSSProperties = {
  textAlign: "center" as const,
  marginBottom: "24px",
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 32px",
  textDecoration: "none",
}

const hrStyle: React.CSSProperties = {
  borderColor: "#e4e4e7",
  margin: "24px 0",
}

const productHighlightStyle: React.CSSProperties = {
  backgroundColor: "#fafafa",
  borderRadius: "8px",
  padding: "20px",
}

const productNameStyle: React.CSSProperties = {
  color: "#18181b",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 8px 0",
}

const productDescStyle: React.CSSProperties = {
  color: "#52525b",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 12px 0",
}

const productLinkStyle: React.CSSProperties = {
  color: "#2563eb",
  fontSize: "14px",
  fontWeight: "500",
  textDecoration: "none",
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

export default CustomerWelcomeEmail
