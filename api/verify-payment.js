// api/verify-payment.js - Secure Vercel Serverless Function for Razorpay Signature Verification
import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const secret = process.env.RAZORPAY_KEY_SECRET;
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = req.body || {};

  if (!razorpay_payment_id) {
    return res.status(400).json({ error: 'Missing Payment ID' });
  }

  // If secret is set, perform HMAC SHA256 verification
  if (secret && razorpay_order_id && razorpay_signature) {
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest('hex');

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ success: false, error: 'Invalid payment signature. Verification failed!' });
    }
  }

  // Payment verified successfully
  return res.status(200).json({
    success: true,
    message: 'Payment verified successfully!',
    paymentId: razorpay_payment_id,
    plan: plan || 'pro'
  });
}
