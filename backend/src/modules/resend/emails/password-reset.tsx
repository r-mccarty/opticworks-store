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
  Link,
  Preview,
} from "@react-email/components"

interface PasswordResetEmailProps {
  email?: string
  token?: string
  reset_url?: string
  customer?: {
    first_name?: string
    last_name?: string
  }
}

export function PasswordResetEmail(props: PasswordResetEmailProps): React.ReactElement {
  const { customer, reset_url } = props

  const customerName = customer?.first_name || "there"
  // Use provided URL or construct a default one
  const resetLink = reset_url || "https://optic.works/auth/reset-password"

  return (
    <Html>
      <Head />
      <Preview>Reset your OpticWorks password</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          {/* Header */}
          <Section style={headerStyle}>
            <Heading style={logoStyle}>OpticWorks</Heading>
          </Section>

          {/* Main Content */}
          <Section style={contentStyle}>
            <Heading style={headingStyle}>Reset Your Password</Heading>
            <Text style={textStyle}>
              Hi {customerName}, we received a request to reset your password. Click
              the button below to create a new password.
            </Text>

            <Section style={buttonSectionStyle}>
              <Button href={resetLink} style={buttonStyle}>
                Reset Password
              </Button>
            </Section>

            <Text style={secondaryTextStyle}>
              This link will expire in 24 hours. If you didn&apos;t request a password
              reset, you can safely ignore this email.
            </Text>

            <Text style={linkFallbackStyle}>
              If the button doesn&apos;t work, copy and paste this link into your
              browser:
              <br />
              <Link href={resetLink} style={linkStyle}>
                {resetLink}
              </Link>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              Need help?{" "}
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
  textAlign: "center" as const,
}

const textStyle: React.CSSProperties = {
  color: "#52525b",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
}

const buttonSectionStyle: React.CSSProperties = {
  margin: "32px 0",
  textAlign: "center" as const,
}

const buttonStyle: React.CSSProperties = {
  backgroundColor: "#18181b",
  borderRadius: "6px",
  color: "#ffffff",
  display: "inline-block",
  fontSize: "16px",
  fontWeight: "600",
  padding: "14px 32px",
  textDecoration: "none",
}

const secondaryTextStyle: React.CSSProperties = {
  color: "#71717a",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 24px 0",
  textAlign: "center" as const,
}

const linkFallbackStyle: React.CSSProperties = {
  backgroundColor: "#f4f4f5",
  borderRadius: "4px",
  color: "#71717a",
  fontSize: "12px",
  lineHeight: "18px",
  padding: "16px",
  wordBreak: "break-all" as const,
}

const linkStyle: React.CSSProperties = {
  color: "#2563eb",
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

const footerCopyrightStyle: React.CSSProperties = {
  color: "#a1a1aa",
  fontSize: "12px",
  margin: 0,
}

export default PasswordResetEmail
