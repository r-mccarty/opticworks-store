import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';

interface PaymentFailedProps {
  customerName: string;
  orderNumber: string;
  amount: number;
  retryUrl: string;
}

export default function PaymentFailed({
  customerName,
  orderNumber,
  amount,
  retryUrl,
}: PaymentFailedProps) {
  const previewText = `Payment failed for order ${orderNumber} - Please update your payment method`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://www.mccarty.ventures/logo.png"
              width="180"
              height="auto"
              alt="OpticWorks"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Payment Failed</Heading>
            <Text style={text}>
              Hi {customerName},
            </Text>
            <Text style={text}>
              We were unable to process your payment for order #{orderNumber}. 
              This could be due to insufficient funds, an expired card, or other payment method issues.
            </Text>

            {/* Order Details */}
            <Section style={orderDetails}>
              <Text style={orderText}>
                <strong>Order Number:</strong> {orderNumber}<br />
                <strong>Amount:</strong> ${amount.toFixed(2)}
              </Text>
            </Section>

            <Text style={text}>
              Don&apos;t worry - your order is still reserved for the next 48 hours. 
              Please update your payment method to complete your purchase.
            </Text>

            {/* Retry Button */}
            <Section style={buttonSection}>
              <Button href={retryUrl} style={button}>
                Update Payment Method
              </Button>
            </Section>

            {/* Help Section */}
            <Section style={helpSection}>
              <Heading style={h3}>Need Help?</Heading>
              <Text style={text}>
                If you continue to experience issues, please contact our support team:
              </Text>
              <Text style={text}>
                • Email: <Link href="mailto:support@mccarty.ventures" style={link}>support@mccarty.ventures</Link><br />
                • Phone: 1-800-OPTIC-WORKS<br />
                • Live Chat: <Link href="https://www.mccarty.ventures/support" style={link}>mccarty.ventures/support</Link>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              OpticWorks - Premium DIY Window Tinting Solutions<br />
              <Link href="https://www.mccarty.ventures" style={footerLink}>www.mccarty.ventures</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const header = {
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const logo = {
  margin: '0 auto',
};

const content = {
  padding: '0 20px',
};

const h1 = {
  color: '#dc2626',
  fontSize: '32px',
  fontWeight: '700',
  margin: '40px 0 20px',
  textAlign: 'center' as const,
};

const h3 = {
  color: '#374151',
  fontSize: '18px',
  fontWeight: '600',
  margin: '24px 0 12px',
};

const text = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const orderDetails = {
  backgroundColor: '#fef2f2',
  border: '1px solid #fecaca',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px 0',
};

const orderText = {
  color: '#7f1d1d',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const helpSection = {
  backgroundColor: '#eff6ff',
  border: '1px solid #3b82f6',
  borderRadius: '8px',
  padding: '20px',
  margin: '32px 0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const footer = {
  borderTop: '1px solid #e5e7eb',
  padding: '32px 20px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0',
};

const footerLink = {
  color: '#9ca3af',
  textDecoration: 'underline',
};