import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface SupportRequestProps {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  category: string;
  orderNumber?: string;
  subject: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  submittedAt?: string;
}

const categoryLabels: Record<string, string> = {
  'installation': 'Installation Help',
  'orders': 'Order & Shipping', 
  'warranty': 'Warranty Claim',
  'billing': 'Payment & Billing',
  'compatibility': 'Product Compatibility',
  'returns': 'Returns & Refunds',
  'other': 'Other'
};

const priorityColors = {
  'low': '#10b981',    // Green
  'medium': '#f59e0b', // Orange  
  'high': '#ef4444'    // Red
};

const priorityLabels = {
  'low': 'Low Priority',
  'medium': 'Medium Priority', 
  'high': 'High Priority'
};

export default function SupportRequest({
  customerName,
  customerEmail,
  customerPhone,
  category,
  orderNumber,
  subject,
  message,
  priority,
  submittedAt = new Date().toLocaleString(),
}: SupportRequestProps) {
  const previewText = `Support Request: ${subject} from ${customerName}`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Heading style={h1}>OpticWorks Support Request</Heading>
            <Text style={headerText}>
              New support request received from your website
            </Text>
          </Section>

          <Section style={content}>
            {/* Priority Badge */}
            <Section style={prioritySection}>
              <Text style={{
                ...priorityBadge,
                backgroundColor: priorityColors[priority],
              }}>
                {priorityLabels[priority]}
              </Text>
            </Section>

            {/* Customer Information */}
            <Section style={section}>
              <Heading style={h2}>Customer Information</Heading>
              <Text style={text}>
                <strong>Name:</strong> {customerName}
              </Text>
              <Text style={text}>
                <strong>Email:</strong> {customerEmail}
              </Text>
              {customerPhone && (
                <Text style={text}>
                  <strong>Phone:</strong> {customerPhone}
                </Text>
              )}
              <Text style={text}>
                <strong>Category:</strong> {categoryLabels[category] || category}
              </Text>
              {orderNumber && (
                <Text style={text}>
                  <strong>Order Number:</strong> {orderNumber}
                </Text>
              )}
              <Text style={text}>
                <strong>Submitted:</strong> {submittedAt}
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Support Request Details */}
            <Section style={section}>
              <Heading style={h2}>Support Request</Heading>
              <Text style={text}>
                <strong>Subject:</strong> {subject}
              </Text>
              <Text style={messageText}>
                <strong>Message:</strong>
              </Text>
              <Text style={messageContent}>
                {message}
              </Text>
            </Section>

            <Hr style={hr} />

            {/* Action Items */}
            <Section style={section}>
              <Heading style={h2}>Next Steps</Heading>
              <Text style={text}>
                Reply directly to this email to respond to the customer at{' '}
                <Link href={`mailto:${customerEmail}`} style={link}>
                  {customerEmail}
                </Link>
              </Text>
              <Text style={text}>
                For high priority requests, aim to respond within 4 hours.
                For medium priority, respond within 24 hours.
              </Text>
            </Section>
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              OpticWorks Window Tinting Support System
            </Text>
            <Text style={footerText}>
              This email was automatically generated from your contact form.
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
  maxWidth: '600px',
};

const header = {
  padding: '32px 32px 0',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#1f2937',
  fontSize: '28px',
  fontWeight: 'bold',
  margin: '0 0 16px',
  lineHeight: '1.3',
};

const headerText = {
  color: '#6b7280',
  fontSize: '16px',
  lineHeight: '1.4',
  margin: '0 0 24px',
};

const content = {
  padding: '0 32px',
};

const prioritySection = {
  textAlign: 'center' as const,
  margin: '0 0 32px',
};

const priorityBadge = {
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 'bold',
  padding: '8px 16px',
  borderRadius: '20px',
  display: 'inline-block',
  margin: '0',
};

const section = {
  margin: '32px 0',
};

const h2 = {
  color: '#1f2937',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const text = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 12px',
};

const messageText = {
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 8px',
};

const messageContent = {
  backgroundColor: '#f9fafb',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  color: '#374151',
  fontSize: '16px',
  lineHeight: '1.6',
  padding: '16px',
  whiteSpace: 'pre-wrap' as const,
  margin: '0',
};

const hr = {
  border: 'none',
  borderTop: '1px solid #e5e7eb',
  margin: '32px 0',
};

const link = {
  color: '#3b82f6',
  textDecoration: 'underline',
};

const footer = {
  padding: '32px 32px 0',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#9ca3af',
  fontSize: '14px',
  lineHeight: '1.4',
  margin: '0 0 8px',
};