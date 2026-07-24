# 🚀 PostCraft AI — Production Deployment & Security Guide

## 🛡️ Security Architecture Overview
- **Zero Client Keys**: Frontend (`app.js`) contains ZERO secret API keys.
- **Serverless API**: AI generation requests go to `/api/generate` where `OPENROUTER_API_KEY` is securely stored in environment variables.
- **Razorpay Verification**: `/api/verify-payment` verifies payment signatures using HMAC SHA256.

---

## ⚡ How to Deploy to Vercel (100% Free - 2 Minutes)

### Method 1: Using Vercel Dashboard (Easiest)
1. Push this code folder to **GitHub** (or drag & drop to Vercel).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In **Environment Variables**, add:
   - `OPENROUTER_API_KEY` = `your_openrouter_api_key_here`
   - `RAZORPAY_KEY_SECRET` = `(Your Razorpay Secret Key)`
4. Click **Deploy**!

### Method 2: Using Vercel CLI (Command Line)
```bash
npm i -g vercel
vercel login
vercel --prod
```
When prompted for environment variables:
- Add `OPENROUTER_API_KEY`

---

## 🛠️ Project Structure
```
linkedin-ai-generator/
├── index.html            # Main HTML UI
├── style.css             # Glassmorphism Dark CSS Design
├── app.js                # Secure Frontend Logic (No Keys!)
├── vercel.json           # Vercel Serverless Routing Config
├── .env.example          # Environment Variable Template
├── README.md             # Deployment Documentation
└── api/                  # 🛡️ Secure Backend Endpoints
    ├── generate.js       # Serverless AI Endpoint
    └── verify-payment.js # Serverless Razorpay Verification
```
