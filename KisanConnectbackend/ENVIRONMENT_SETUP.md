# Environment Setup for Payment Integration

## Required Environment Variables

You need to create a `.env` file in the `KisanConnectbackend` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=kisanconnect
DB_PORT=5432

# Server Configuration
PORT=3000

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Razorpay Configuration
# Get these from your Razorpay Dashboard: https://dashboard.razorpay.com/app/keys
RAZORPAY_KEY_ID=rzp_test_your_test_key_id_here
RAZORPAY_KEY_SECRET=your_test_key_secret_here

# For production, use live keys:
# RAZORPAY_KEY_ID=rzp_live_your_live_key_id_here
# RAZORPAY_KEY_SECRET=your_live_key_secret_here
```

## How to Get Razorpay API Keys

1. **Sign up for Razorpay**: Go to https://razorpay.com and create an account
2. **Access Dashboard**: Login to your Razorpay dashboard
3. **Get API Keys**: 
   - Go to Settings → API Keys
   - Generate a new key pair
   - Copy the Key ID and Key Secret
4. **Test vs Live Keys**:
   - Use test keys for development (start with `rzp_test_`)
   - Use live keys for production (start with `rzp_live_`)

## Steps to Fix the Current Error

1. Create the `.env` file in `KisanConnectbackend/` directory
2. Add your actual Razorpay API keys (not the placeholder values)
3. Restart your backend server

## Example .env file content:

```env
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=mypassword123
DB_NAME=kisanconnect
DB_PORT=5432
PORT=3000
JWT_SECRET=my_super_secret_jwt_key_2024
RAZORPAY_KEY_ID=rzp_test_1234567890abcdef
RAZORPAY_KEY_SECRET=abcdef1234567890abcdef1234567890
```

## Important Notes

- Never commit your `.env` file to version control
- Keep your API keys secure and don't share them
- Use test keys during development
- The `.env` file should be in the same directory as `server.js` 