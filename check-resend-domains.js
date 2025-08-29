import { Resend } from 'resend';
import { config } from 'dotenv';

// Load environment variables
config();

const checkResendDomains = async () => {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    console.log('🔍 Checking Resend domain configuration...');
    console.log('API Key (first 10 chars):', process.env.RESEND_API_KEY?.substring(0, 10) + '...');
    console.log('FROM_EMAIL:', process.env.NEXT_PUBLIC_FROM_EMAIL);
    
    // List all domains
    const domains = await resend.domains.list();
    console.log('\n📋 All Resend domains:');
    console.log(JSON.stringify(domains, null, 2));
    
    // Check specific domain
    if (domains.data && domains.data.length > 0) {
      for (const domain of domains.data) {
        console.log(`\n🔍 Domain details for: ${domain.name}`);
        const domainDetails = await resend.domains.get(domain.id);
        console.log(JSON.stringify(domainDetails, null, 2));
        
        if (domain.name === 'notifications.optic.works') {
          console.log('\n✅ Found notifications.optic.works domain');
          console.log('Status:', domainDetails.data?.status);
          console.log('Region:', domainDetails.data?.region);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking Resend domains:', error);
  }
};

checkResendDomains();