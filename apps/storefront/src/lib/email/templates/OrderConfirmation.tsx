import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface OrderConfirmationProps {
  customerName: string;
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export default function OrderConfirmation({
  customerName,
  orderNumber,
  items,
  subtotal,
  tax,
  shipping,
  total,
  shippingAddress,
}: OrderConfirmationProps) {
  const previewText = `Order ${orderNumber} confirmed - Your OpticWorks tinting kit is on the way!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Img
              src="https://pub-e97850e2b6554798b4b0ec23548c975d.r2.dev/logo.png"
              width="180"
              height="auto"
              alt="OpticWorks"
              style={logo}
            />
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Order Confirmed!</Heading>
            <Text style={text}>
              Hi {customerName},
            </Text>
            <Text style={text}>
              Thank you for your order! We&apos;ve received your payment and your OpticWorks tinting kit is being prepared for shipment.
            </Text>
            
            <Section style={orderDetails}>
              <Heading style={h2}>Order #{orderNumber}</Heading>
              
              {/* Order Items */}
              {items.map((item, index) => (
                <Row key={index} style={itemRow}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQty}>Qty: {item.quantity}</Text>
                  <Text style={itemPrice}>${item.price.toFixed(2)}</Text>
                </Row>
              ))}
              
              <Hr style={divider} />
              
              {/* Order Totals */}
              <Row style={totalRow}>
                <Text style={totalLabel}>Subtotal:</Text>
                <Text style={totalValue}>${subtotal.toFixed(2)}</Text>
              </Row>
              <Row style={totalRow}>
                <Text style={totalLabel}>Tax:</Text>
                <Text style={totalValue}>${tax.toFixed(2)}</Text>
              </Row>
              <Row style={totalRow}>
                <Text style={totalLabel}>Shipping:</Text>
                <Text style={totalValue}>${shipping.toFixed(2)}</Text>
              </Row>
              <Row style={finalTotalRow}>
                <Text style={finalTotalLabel}>Total:</Text>
                <Text style={finalTotalValue}>${total.toFixed(2)}</Text>
              </Row>
            </Section>

            {/* Shipping Address */}
            <Section style={addressSection}>
              <Heading style={h3}>Shipping Address</Heading>
              <Text style={address}>
                {shippingAddress.name}<br />
                {shippingAddress.address1}<br />
                {shippingAddress.address2 && (
                  <>{shippingAddress.address2}<br /></>
                )}
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}
              </Text>
            </Section>

            {/* Next Steps */}
            <Section style={nextSteps}>
              <Heading style={h3}>What&apos;s Next?</Heading>
              <Text style={text}>
                • You&apos;ll receive a shipping notification with tracking information within 1-2 business days<br />
                • Your installation guides are available at <Link href="https://optic.works/install-guides" style={link}>optic.works/install-guides</Link><br />
                {items.some(item => item.name.toLowerCase().includes('tesla')) && (
                  <>• Tesla-specific installation guide: <Link href="https://optic.works/install-guides/cybershade-irx-tesla-model-y" style={link}>Model Y Guide</Link><br /></>
                )}
                • Need help? Contact our support team at <Link href="mailto:support@notifications.optic.works" style={link}>support@notifications.optic.works</Link><br />
                • &quot;Oops Protection&quot; warranty available at <Link href="https://optic.works/support/oops" style={link}>optic.works/support/oops</Link>
              </Text>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              OpticWorks - Premium DIY Window Tinting Solutions<br />
              <Link href="https://optic.works" style={footerLink}>www.optic.works</Link>
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
  color: '#1f2937',
  fontSize: '32px',
  fontWeight: '700',
  margin: '40px 0 20px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#374151',
  fontSize: '24px',
  fontWeight: '600',
  margin: '32px 0 16px',
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
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '24px',
  margin: '32px 0',
};

const itemRow = {
  borderBottom: '1px solid #e5e7eb',
  padding: '12px 0',
};

const itemName = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  width: '60%',
  display: 'inline-block',
};

const itemQty = {
  color: '#6b7280',
  fontSize: '14px',
  margin: '0',
  width: '20%',
  display: 'inline-block',
  textAlign: 'center' as const,
};

const itemPrice = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  width: '20%',
  display: 'inline-block',
  textAlign: 'right' as const,
};

const divider = {
  border: '0',
  borderTop: '2px solid #e5e7eb',
  margin: '16px 0',
};

const totalRow = {
  padding: '8px 0',
};

const totalLabel = {
  color: '#6b7280',
  fontSize: '16px',
  margin: '0',
  width: '80%',
  display: 'inline-block',
  textAlign: 'right' as const,
};

const totalValue = {
  color: '#1f2937',
  fontSize: '16px',
  fontWeight: '500',
  margin: '0',
  width: '20%',
  display: 'inline-block',
  textAlign: 'right' as const,
};

const finalTotalRow = {
  borderTop: '2px solid #e5e7eb',
  padding: '12px 0 0',
  marginTop: '8px',
};

const finalTotalLabel = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
  width: '80%',
  display: 'inline-block',
  textAlign: 'right' as const,
};

const finalTotalValue = {
  color: '#1f2937',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0',
  width: '20%',
  display: 'inline-block',
  textAlign: 'right' as const,
};

const addressSection = {
  margin: '32px 0',
};

const address = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0',
};

const nextSteps = {
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