# Payment Gateway Integration for KisanConnect

This document provides a complete overview of the Razorpay payment gateway integration implemented in the KisanConnect project.

## 🎯 Overview

The payment integration allows buyers to securely pay for their agricultural product orders using Razorpay, a popular payment gateway in India. The integration includes:

- **Backend API endpoints** for payment processing
- **Frontend payment flow** with Razorpay checkout
- **Payment verification** and order status updates
- **Payment status tracking** in order history
- **Database schema updates** for payment data

## 🏗️ Architecture

### Backend Components

1. **Payment Routes** (`/api/payments`)
   - `POST /create-order` - Creates Razorpay payment order
   - `POST /verify` - Verifies payment completion
   - `GET /status/:order_id` - Gets payment status

2. **Database Schema Updates**
   - Added payment fields to `orders` table
   - Payment tracking and status management

3. **Security Features**
   - Payment signature verification
   - User authentication and authorization
   - Secure API key management

### Frontend Components

1. **Payment Service** - Handles payment API calls
2. **Payment Success Modal** - Shows payment confirmation
3. **Order History Updates** - Displays payment status
4. **Razorpay Integration** - Loads and manages checkout

## 🚀 Setup Instructions

### 1. Backend Setup

```bash
cd KisanConnectbackend

# Install dependencies
npm install

# Create .env file with your configuration
cp .env.example .env
# Edit .env with your actual values

# Run database migration
node run-migration.js

# Start the server
npm start
```

### 2. Environment Variables

Create a `.env` file in `KisanConnectbackend/`:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kisanconnect
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret

# Razorpay (Get these from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_your_test_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret

# Server
PORT=3000
```

### 3. Frontend Setup

```bash
cd kisanConnectFE

# Install dependencies (if not already done)
npm install

# Start the frontend
ng serve
```

## 💳 Payment Flow

### 1. Order Placement
```
Buyer selects crop → Enters quantity → Clicks "Place Order & Pay"
```

### 2. Payment Initiation
```
Frontend calls /api/orders/place → Backend creates pending order
Frontend calls /api/payments/create-order → Backend creates Razorpay order
```

### 3. Payment Processing
```
Razorpay checkout modal opens → Buyer enters payment details
Payment processed by Razorpay → Success/failure response
```

### 4. Payment Verification
```
Frontend calls /api/payments/verify → Backend verifies signature
Order status updated to 'confirmed' → Payment marked as 'completed'
```

### 5. Success Confirmation
```
Payment success modal shows → Order history updated
Buyer can view order with payment details
```

## 🔧 API Endpoints

### Create Payment Order
```http
POST /api/payments/create-order
Authorization: Bearer <token>
Content-Type: application/json

{
  "order_id": 123,
  "amount": 1500,
  "currency": "INR"
}
```

**Response:**
```json
{
  "order_id": "order_ABC123",
  "amount": 150000,
  "currency": "INR",
  "key_id": "rzp_test_..."
}
```

### Verify Payment
```http
POST /api/payments/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "razorpay_order_id": "order_ABC123",
  "razorpay_payment_id": "pay_XYZ789",
  "razorpay_signature": "abc123...",
  "order_id": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "payment_id": "pay_XYZ789"
}
```

### Get Payment Status
```http
GET /api/payments/status/123
Authorization: Bearer <token>
```

**Response:**
```json
{
  "payment_status": "completed",
  "payment_id": "pay_XYZ789",
  "payment_order_id": "order_ABC123",
  "status": "confirmed"
}
```

## 🗄️ Database Schema

### Orders Table Updates

```sql
ALTER TABLE orders 
ADD COLUMN payment_order_id VARCHAR(255),
ADD COLUMN payment_id VARCHAR(255),
ADD COLUMN payment_status VARCHAR(50) DEFAULT 'pending';

-- Indexes for performance
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_payment_order_id ON orders(payment_order_id);
```

### Payment Status Values
- `pending` - Payment not yet initiated
- `completed` - Payment successful
- `failed` - Payment failed

## 🎨 Frontend Components

### Payment Service (`payment.service.ts`)
- Handles all payment-related API calls
- Manages Razorpay script loading
- Provides payment initialization methods

### Payment Success Modal (`payment-success-modal.component.ts`)
- Shows payment confirmation
- Displays order and payment details
- Provides navigation options

### Updated Order History
- Shows payment status for each order
- Displays payment IDs
- Color-coded payment status indicators

## 🔒 Security Features

1. **Payment Signature Verification**
   - Backend verifies Razorpay payment signatures
   - Prevents payment tampering

2. **User Authentication**
   - All payment endpoints require valid JWT tokens
   - Users can only access their own payment data

3. **Order Ownership Verification**
   - Backend ensures users can only pay for their own orders
   - Prevents unauthorized payment access

4. **Secure Key Management**
   - Razorpay secret key only stored on backend
   - Environment variables for sensitive data

## 🧪 Testing

### Test Card Details
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
Name: Any name
```

### Test Scenarios
1. **Successful Payment**
   - Place order → Complete payment → Verify success

2. **Failed Payment**
   - Place order → Cancel payment → Check order status

3. **Payment Verification**
   - Test signature verification with invalid signatures

## 🚨 Error Handling

### Common Errors
1. **Payment verification failed** - Check signature generation
2. **Order not found** - Verify order exists and belongs to user
3. **Insufficient funds** - Handle payment failures gracefully
4. **Network issues** - Implement retry mechanisms

### Error Responses
```json
{
  "error": "Payment verification failed",
  "details": "Invalid signature"
}
```

## 📊 Monitoring

### Key Metrics to Track
1. Payment success rate
2. Payment processing time
3. Failed payment reasons
4. Order completion rate

### Logging
- Payment initiation logs
- Payment verification logs
- Error logs with details
- Order status change logs

## 🔄 Future Enhancements

1. **Webhook Integration**
   - Real-time payment status updates
   - Automatic order status management

2. **Multiple Payment Methods**
   - UPI integration
   - Net banking options
   - Digital wallets

3. **Payment Analytics**
   - Payment success analytics
   - Revenue tracking
   - Payment method preferences

4. **Refund Processing**
   - Automated refund handling
   - Refund status tracking

## 📞 Support

For issues related to:
- **Razorpay Integration**: Check Razorpay documentation
- **Backend Issues**: Review server logs and API responses
- **Frontend Issues**: Check browser console and network tab
- **Database Issues**: Verify migration and schema updates

## 📝 Notes

- Always use test keys during development
- Implement proper error handling in production
- Monitor payment transactions regularly
- Keep Razorpay SDK updated
- Follow security best practices 