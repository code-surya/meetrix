# Payment Gateway Integration Guide

## Overview

This Rails API integrates with both Stripe and Razorpay payment gateways, providing a secure payment flow with webhook handling and payment verification.

## Supported Gateways

1. **Stripe** - International payments
2. **Razorpay** - India-focused payments

## Architecture

### Service Classes

- `PaymentGatewayService` - Abstract base class
- `StripePaymentService` - Stripe implementation
- `RazorpayPaymentService` - Razorpay implementation

### Flow

1. **Create Payment Intent** - Client requests payment intent
2. **Client-side Processing** - User completes payment on frontend
3. **Confirm Payment** - Backend verifies and confirms payment
4. **Webhook Processing** - Gateway sends webhook for status updates
5. **Booking Confirmation** - Booking is confirmed after successful payment

## Environment Variables

### Stripe
```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Razorpay
```bash
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...
```

## API Endpoints

### 1. Create Payment Intent

**Endpoint:** `POST /api/v1/payments`

**Request:**
```json
{
  "booking_id": 1,
  "gateway": "stripe",
  "currency": "USD",
  "payment_method": "credit_card"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "payment": {
      "id": 1,
      "amount": 75.0,
      "currency": "USD",
      "status": "pending"
    },
    "payment_intent": {
      "payment_intent_id": "pi_1234567890",
      "client_secret": "pi_1234567890_secret_..."
    }
  }
}
```

### 2. Confirm Payment

**Endpoint:** `POST /api/v1/payments/:id/confirm`

**Request (Stripe):**
```json
{
  "payment_intent_id": "pi_1234567890",
  "gateway": "stripe"
}
```

**Request (Razorpay):**
```json
{
  "payment_id": "pay_1234567890",
  "order_id": "order_1234567890",
  "gateway": "razorpay"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "data": {
    "payment": {
      "id": 1,
      "status": "completed",
      "transaction_id": "pi_1234567890"
    }
  }
}
```

### 3. Refund Payment

**Endpoint:** `POST /api/v1/payments/:id/refund`

**Request:**
```json
{
  "amount": 75.0
}
```

**Response:**
```json
{
  "success": true,
  "message": "Refund processed successfully",
  "data": {
    "payment": {
      "status": "refunded",
      "refunded_amount": 75.0
    },
    "refund": {
      "refund_id": "re_1234567890",
      "amount": 75.0
    }
  }
}
```

### 4. Webhook Endpoints

#### Stripe Webhook
**Endpoint:** `POST /api/v1/webhooks/stripe`

**Headers:**
```
Stripe-Signature: t=1234567890,v1=...
```

#### Razorpay Webhook
**Endpoint:** `POST /api/v1/webhooks/razorpay`

**Headers:**
```
X-Razorpay-Signature: ...
```

## Frontend Integration

### Stripe Integration

```javascript
// 1. Create payment intent
const response = await fetch('/api/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    booking_id: 1,
    gateway: 'stripe'
  })
});

const { payment_intent } = await response.json();

// 2. Confirm payment with Stripe.js
const stripe = Stripe('pk_test_...');
const { error, paymentIntent } = await stripe.confirmCardPayment(
  payment_intent.client_secret,
  {
    payment_method: {
      card: cardElement,
      billing_details: {
        name: 'John Doe'
      }
    }
  }
);

// 3. Confirm payment on backend
if (paymentIntent.status === 'succeeded') {
  await fetch(`/api/v1/payments/${payment.id}/confirm`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      payment_intent_id: paymentIntent.id,
      gateway: 'stripe'
    })
  });
}
```

### Razorpay Integration

```javascript
// 1. Create payment order
const response = await fetch('/api/v1/payments', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    booking_id: 1,
    gateway: 'razorpay'
  })
});

const { payment_intent } = await response.json();

// 2. Initialize Razorpay
const options = {
  key: payment_intent.key_id,
  amount: payment_intent.amount,
  currency: payment_intent.currency,
  order_id: payment_intent.order_id,
  name: 'Meetrix',
  description: 'Event Booking',
  handler: async function(response) {
    // 3. Confirm payment on backend
    await fetch(`/api/v1/payments/${payment.id}/confirm`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        payment_id: response.razorpay_payment_id,
        order_id: response.razorpay_order_id,
        gateway: 'razorpay'
      })
    });
  }
};

const razorpay = new Razorpay(options);
razorpay.open();
```

## Webhook Events

### Stripe Events

- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.canceled` - Payment canceled
- `charge.refunded` - Refund processed

### Razorpay Events

- `payment.authorized` - Payment authorized
- `payment.captured` - Payment captured
- `payment.failed` - Payment failed
- `refund.created` - Refund initiated
- `refund.processed` - Refund completed

## Security Features

### 1. Webhook Signature Verification

Both gateways verify webhook signatures to ensure authenticity:

```ruby
# Stripe
Stripe::Webhook.construct_event(payload, signature, webhook_secret)

# Razorpay
Razorpay::Utility.verify_webhook_signature(payload, signature, webhook_secret)
```

### 2. Payment Verification

- Payment status is verified from gateway
- Transaction IDs are stored and validated
- Double-spending prevention through booking status checks

### 3. Secure Storage

- Payment credentials stored in environment variables
- Webhook secrets never exposed
- Payment method details encrypted in database

## Payment Status Flow

```
pending → processing → completed
              ↓
          failed/refunded
```

## Error Handling

### Common Errors

1. **Invalid Payment Intent**
```json
{
  "success": false,
  "error": {
    "message": "Payment intent ID required"
  }
}
```

2. **Payment Failed**
```json
{
  "success": false,
  "error": {
    "message": "Payment confirmation failed",
    "errors": ["Payment was canceled"]
  }
}
```

3. **Invalid Webhook Signature**
```json
{
  "success": false,
  "error": {
    "message": "Invalid signature"
  }
}
```

## Testing

### Stripe Test Mode

Use Stripe test keys:
- Test Secret Key: `sk_test_...`
- Test Publishable Key: `pk_test_...`
- Test Cards: https://stripe.com/docs/testing

### Razorpay Test Mode

Use Razorpay test keys:
- Test Key ID: `rzp_test_...`
- Test Key Secret: `...`
- Test Cards: https://razorpay.com/docs/payments/test-cards

## Webhook Logging

All webhook events are logged in the `webhook_logs` table for debugging and audit purposes:

```ruby
WebhookLog.create!(
  gateway: 'stripe',
  event_type: 'payment_intent.succeeded',
  event_id: 'evt_1234567890',
  payload: event.to_json,
  processed: true
)
```

## Best Practices

1. **Always verify webhook signatures**
2. **Idempotency** - Handle duplicate webhook events
3. **Retry logic** - Retry failed webhook processing
4. **Logging** - Log all payment events for audit
5. **Error handling** - Gracefully handle payment failures
6. **Security** - Never expose secret keys or webhook secrets
7. **Testing** - Test with gateway test modes before production

## Production Checklist

- [ ] Set production API keys
- [ ] Configure webhook endpoints in gateway dashboards
- [ ] Set webhook secrets
- [ ] Enable HTTPS for webhook endpoints
- [ ] Test webhook delivery
- [ ] Set up monitoring and alerts
- [ ] Configure retry logic for failed webhooks
- [ ] Set up payment reconciliation process

