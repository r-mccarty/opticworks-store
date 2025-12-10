import CryptoJS from 'crypto-js';

addHandler('transform', (request, context) => {
  const headers = request.headers;
  const signatureHeader = headers['x-hmac-signature'];

  if (!signatureHeader) {
    throw new Error('Missing X-Hmac-Signature header');
  }

  // 1. Strip the prefix to get the raw hex digest
  const receivedSignature = signatureHeader.replace('hmac-sha256-hex=', '');

  // 2. Serialize the body to string for signing
  // WARNING: This assumes the provider sends minified JSON.
  // If EasyPost sends pretty-printed JSON, this will fail.
  const payloadString = JSON.stringify(request.body);

  const secret = process.env.EASYPOST_WEBHOOK_SECRET;

  // 3. Compute HMAC
  const expectedSignature = CryptoJS.HmacSHA256(payloadString, secret).toString(CryptoJS.enc.Hex);

  // 4. Compare
  if (receivedSignature !== expectedSignature) {
    throw new Error(`Invalid Signature. Expected ${expectedSignature}, got ${receivedSignature}`);
  }

  // 5. Success - Signal verification to your backend
  request.headers['x-hookdeck-verified-worker'] = 'true';

  return request;
});
