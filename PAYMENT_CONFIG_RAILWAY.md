# Payment Configuration for Railway Deployment

## Required Environment Variables

For payments to work in production, you need to set these two environment variables in Railway:

### 1. `ADMIN_WALLET_ADDRESS`
- **What it is**: Your wallet address that receives all payments
- **Format**: `0x` followed by 40 hexadecimal characters
- **Example**: `0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0`
- **Where to get it**: Your MetaMask wallet address or any Ethereum-compatible wallet

### 2. `POLYGON_RPC_URL`
- **What it is**: RPC endpoint URL for Polygon network (used to verify transactions)
- **Format**: Full HTTPS URL with API key
- **Example**: `https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY`
- **Where to get it**: 
  - [Alchemy](https://www.alchemy.com/) - Create free account, create Polygon Mumbai app
  - [Infura](https://www.infura.io/) - Create free account, create Polygon Mumbai endpoint
  - [QuickNode](https://www.quicknode.com/) - Alternative RPC provider

---

## How to Set in Railway

### Step 1: Open Railway Backend Service
1. Go to [Railway Dashboard](https://railway.app)
2. Select your **Backend** service (Go + Gin)
3. Click on **Variables** tab

### Step 2: Add Environment Variables

Click **+ New Variable** and add:

#### Variable 1: `ADMIN_WALLET_ADDRESS`
```
Key: ADMIN_WALLET_ADDRESS
Value: 0xYourWalletAddressHere
```

#### Variable 2: `POLYGON_RPC_URL`
```
Key: POLYGON_RPC_URL
Value: https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
```

**⚠️ Important**: Replace `YOUR_API_KEY` with your actual Alchemy/Infura API key!

### Step 3: Verify Configuration

After adding both variables:
1. Railway will automatically redeploy your service
2. Check the logs to ensure no errors
3. Test payment verification endpoint

---

## Network Configuration

### Current Setup: Polygon Mumbai (Testnet)

The code is configured for **Polygon Mumbai** testnet:
- **Network ID**: 80001
- **Chain ID**: 80001
- **RPC URL**: Must be Polygon Mumbai endpoint
- **Test MATIC**: Get from [Polygon Faucet](https://faucet.polygon.technology/)

### For Production (Polygon Mainnet)

If you want to use Polygon Mainnet:
1. Change RPC URL to mainnet endpoint:
   ```
   https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY
   ```
2. Update frontend network configuration (if needed)
3. Use real MATIC tokens (not test tokens)

---

## Complete Railway Environment Variables Checklist

Make sure you have ALL these variables set in Railway Backend:

```env
# Server
PORT=8080

# Database
MONGO_URI=mongodb+srv://rizeos_user:Qwertyuiop%40123%23@rizeos.ocor2vc.mongodb.net/rizeos?retryWrites=true&w=majority

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
ADMIN_SIGNUP_CODE=your-admin-secret-code

# Payments (REQUIRED FOR PAYMENTS TO WORK)
ADMIN_WALLET_ADDRESS=0xYourWalletAddress
POLYGON_RPC_URL=https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY
PLATFORM_FEE_MATIC=0.1

# CORS
CORS_ALLOWED_ORIGINS=https://your-app.vercel.app

# AI Service
AI_SERVICE_URL=https://your-ai-service.railway.app
```

---

## Testing Payment Configuration

### 1. Check Backend Health
```bash
curl https://your-backend.railway.app/api/health
```

### 2. Check Public Config (includes wallet address)
```bash
curl https://your-backend.railway.app/api/config/public
```

Should return:
```json
{
  "data": {
    "admin_wallet_address": "0xYourWalletAddress",
    "platform_fee_matic": 0.1
  }
}
```

### 3. Test Payment Verification
1. Make a test payment from MetaMask to your admin wallet
2. Copy the transaction hash
3. Send POST request to verify:
```bash
curl -X POST https://your-backend.railway.app/api/payments/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"tx_hash": "0xYourTransactionHash"}'
```

---

## Common Issues

### ❌ "admin wallet or RPC not configured"
- **Cause**: `ADMIN_WALLET_ADDRESS` or `POLYGON_RPC_URL` is missing/empty
- **Fix**: Add both variables in Railway Variables tab

### ❌ "payment recipient mismatch"
- **Cause**: Transaction was sent to different wallet address
- **Fix**: Ensure payment is sent to the exact address in `ADMIN_WALLET_ADDRESS`

### ❌ "transaction not confirmed"
- **Cause**: Transaction hasn't been mined yet or failed
- **Fix**: Wait for transaction confirmation, check on [PolygonScan](https://mumbai.polygonscan.com/)

### ❌ "insufficient fee amount"
- **Cause**: Payment amount is less than `PLATFORM_FEE_MATIC` (default 0.1 MATIC)
- **Fix**: Send at least 0.1 MATIC (or adjust `PLATFORM_FEE_MATIC`)

---

## Security Best Practices

1. ✅ **Never commit** `.env` file to git
2. ✅ **Use strong JWT_SECRET** (32+ random characters)
3. ✅ **Keep RPC API keys secret** (don't share publicly)
4. ✅ **Use separate wallets** for testnet and mainnet
5. ✅ **Verify wallet address** before setting in Railway

---

## Quick Setup Script

Copy these values from your local `.env` file (lines 1-10) and paste into Railway:

1. Open your local `.env` file
2. Find `ADMIN_WALLET_ADDRESS` and `POLYGON_RPC_URL`
3. Copy the values
4. Paste into Railway Variables tab
5. Save and wait for redeploy

---

**Last Updated**: 2024

