#!/usr/bin/env node

/**
 * Debug script for testing Stripe webhook integration locally
 * 
 * Usage:
 * 1. Start your Next.js dev server: npm run dev
 * 2. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 * 3. Login to Stripe CLI: stripe login
 * 4. Run this script: node debug-webhook.js
 * 5. In another terminal, trigger a test event: stripe trigger checkout.session.completed
 */

console.log('🔧 Stripe Webhook Debug Setup');
console.log('================================');

// Check environment variables
const requiredEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET_DEV',
  'RESEND_API_KEY', 
  'NEXT_PUBLIC_FROM_EMAIL'
];

console.log('\n📋 Environment Variables Check:');
requiredEnvVars.forEach(envVar => {
  const value = process.env[envVar];
  if (value) {
    console.log(`✅ ${envVar}: ${envVar.includes('SECRET') || envVar.includes('KEY') ? '[HIDDEN]' : value}`);
  } else {
    console.log(`❌ ${envVar}: NOT SET`);
  }
});

console.log('\n🚀 Steps to test webhook:');
console.log('1. Make sure your Next.js dev server is running: npm run dev');
console.log('2. In a new terminal, forward webhooks: stripe listen --forward-to localhost:3000/api/stripe/webhook');
console.log('3. Copy the webhook signing secret (whsec_...) to STRIPE_WEBHOOK_SECRET_DEV');
console.log('4. In another terminal, trigger a test event: stripe trigger checkout.session.completed');
console.log('5. Watch the logs in your Next.js dev server for webhook processing');

console.log('\n📧 Expected Email Flow:');
console.log('- Webhook receives checkout.session.completed event');
console.log('- Extracts customer email from session.customer_details.email');
console.log('- Extracts shipping address from session.shipping.address');
console.log('- Sends order confirmation email via Resend');
console.log('- Logs success/failure with detailed information');

console.log('\n🔍 Troubleshooting:');
console.log('- If signature verification fails: Check STRIPE_WEBHOOK_SECRET_DEV matches CLI output');
console.log('- If no email sent: Check RESEND_API_KEY and NEXT_PUBLIC_FROM_EMAIL are set');
console.log('- If template error: Verify React Email templates are properly imported');
console.log('- Check webhook logs in: Stripe Dashboard > Developers > Webhooks');

console.log('\n📝 Test with real Stripe Checkout:');
console.log('1. Create a test checkout session in Stripe Dashboard');
console.log('2. Include customer email and shipping address');  
console.log('3. Complete payment with test card: 4242 4242 4242 4242');
console.log('4. Verify webhook triggers and email is sent');

console.log('\n⚠️  Production Setup:');
console.log('- Update Stripe Dashboard webhook events to: checkout.session.completed');
console.log('- Remove old payment_intent.* events (except payment_intent.payment_failed)');
console.log('- Set STRIPE_WEBHOOK_SECRET to production webhook secret');
console.log('- Verify RESEND_API_KEY has "Sending access" permissions');

console.log('\n✨ Debug complete! Follow the steps above to test your webhook.');