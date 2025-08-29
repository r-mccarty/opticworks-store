// Debug production email issues
const debugProductionEmail = async () => {
  console.log('🔍 Debugging production email at www.optic.works');
  
  try {
    // Test the production API endpoint directly
    console.log('📡 Testing production email API...');
    
    const response = await fetch('https://www.optic.works/api/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: 'delivered@resend.dev',
        subject: 'Production Test - OpticWorks Email System',
        template: 'order-confirmation',
        data: {
          customerName: 'Production Test User',
          customerEmail: 'delivered@resend.dev',
          orderNumber: 'TEST-PROD-001',
          items: [
            {
              name: 'Production Test Item',
              quantity: 1,
              price: 99.99
            }
          ],
          subtotal: 99.99,
          tax: 8.00,
          shipping: 0.00,
          total: 107.99,
          shippingAddress: {
            name: 'Test User',
            address1: '123 Test St',
            city: 'Test City',
            state: 'CA',
            zipCode: '90210'
          }
        }
      }),
    });

    const result = await response.json();
    
    console.log('📊 Production API Response:');
    console.log('Status:', response.status);
    console.log('Success:', response.ok);
    console.log('Response:', result);
    
    if (!response.ok) {
      console.error('❌ Production email API failed');
      console.error('Error details:', result);
    } else if (result.success) {
      console.log('✅ Production email API succeeded');
      console.log('Message ID:', result.messageId);
    } else {
      console.log('⚠️ API responded OK but email sending failed');
      console.log('Error:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Network error testing production API:', error);
  }
};

debugProductionEmail();