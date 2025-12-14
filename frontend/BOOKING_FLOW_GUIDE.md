# Booking Flow Implementation Guide

## Overview

A smooth, multi-step booking flow with comprehensive error handling, loading states, and excellent UX.

## Booking Flow Steps

### Step 1: Select Tickets
- Display available ticket types
- Quantity selection with validation
- Real-time availability checking
- Visual feedback for selections

### Step 2: Group Booking Option
- Toggle group booking
- Create or join groups
- Discount preview
- Group size requirements

### Step 3: Review & Price Breakdown
- Complete booking summary
- Price calculations
- Discount display
- Terms and conditions

### Step 4: Payment
- Payment gateway selection (Stripe/Razorpay)
- Secure payment processing
- Payment status tracking

### Step 5: Confirmation
- Booking confirmation display
- QR code generation
- Email confirmation
- Print option

## Components

### BookingPage
**Location:** `src/pages/Booking/BookingPage.tsx`

**Features:**
- Multi-step wizard
- Progress indicator
- Step validation
- Error handling
- Loading states
- Navigation controls

**State Management:**
- Selected tickets
- Group booking settings
- Current step
- Booking data
- Errors

### TicketSelector
**Location:** `src/components/booking/TicketSelector/TicketSelector.tsx`

**Features:**
- Expandable ticket cards
- Quantity controls (+/- buttons)
- Direct input
- Availability display
- Sold-out handling
- Real-time subtotal

### GroupBookingOption
**Location:** `src/components/booking/GroupBookingOption/GroupBookingOption.tsx`

**Features:**
- Toggle switch
- Discount calculation
- Group creation
- Group joining
- Discount tier display
- Savings preview

### PriceBreakdown
**Location:** `src/components/booking/PriceBreakdown/PriceBreakdown.tsx`

**Features:**
- Event summary
- Ticket details
- Subtotal calculation
- Discount display
- Total amount
- Terms and conditions

### PaymentRedirect
**Location:** `src/components/booking/PaymentRedirect/PaymentRedirect.tsx`

**Features:**
- Payment gateway selection
- Stripe integration
- Razorpay integration
- Payment initialization
- Error handling

### BookingConfirmationPage
**Location:** `src/pages/Booking/BookingConfirmationPage.tsx`

**Features:**
- Success/pending status
- Booking details
- QR code display
- Payment information
- Action buttons

## State Management

### Redux Slice (bookingsSlice.ts)
```typescript
interface BookingsState {
  currentBooking: any | null;
  bookingStep: 'tickets' | 'group' | 'review' | 'payment' | 'confirming';
}
```

### Custom Hooks

#### useBookings
- `createBooking`: Create single booking
- `createGroupBooking`: Create group booking
- Loading and error states

#### useBooking
- `confirmBooking`: Confirm pending booking
- `cancelBooking`: Cancel booking
- Booking data fetching

#### useGroups
- `fetchGroups`: Get available groups
- `createGroup`: Create new group
- `joinGroup`: Join existing group

#### usePayments
- `createPaymentIntent`: Initialize payment
- `confirmPayment`: Confirm payment

## Error Handling

### Validation Errors
- Ticket availability
- Quantity limits
- Group requirements
- Payment failures

### Error Display
- Inline field errors
- General error messages
- Retry mechanisms
- User-friendly messages

## Loading States

### Component-Level Loading
- Ticket selector loading
- Group fetching
- Payment initialization
- Booking confirmation

### Global Loading
- Full-page loading
- Button loading states
- Progress indicators

## UX Features

### Progress Indicator
- Visual step progress
- Completed step highlighting
- Current step emphasis

### Smooth Transitions
- Step transitions
- Loading animations
- Error animations

### Responsive Design
- Mobile-optimized
- Tablet support
- Desktop experience

### Accessibility
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management

## API Integration

### Booking Creation
```typescript
POST /api/v1/bookings
{
  "event_id": 1,
  "ticket_requests": [
    { "ticket_type_id": 1, "quantity": 2 }
  ]
}
```

### Group Booking
```typescript
POST /api/v1/bookings
{
  "event_id": 1,
  "group_id": 5,
  "ticket_requests": [...]
}
```

### Payment Intent
```typescript
POST /api/v1/payments
{
  "booking_id": 1,
  "gateway": "stripe"
}
```

## User Flow

```
1. User selects event → BookingPage
2. Select tickets → TicketSelector
3. (Optional) Enable group booking → GroupBookingOption
4. Review booking → PriceBreakdown
5. Initialize payment → PaymentRedirect
6. Complete payment → Stripe/Razorpay
7. Confirm booking → BookingConfirmationPage
```

## Error Scenarios

### Ticket Unavailable
- Show error message
- Highlight unavailable tickets
- Suggest alternatives

### Payment Failure
- Display error
- Allow retry
- Preserve booking data

### Network Error
- Retry mechanism
- Offline detection
- Error recovery

## Best Practices

1. **Validate Early**: Check availability before allowing selection
2. **Clear Feedback**: Show loading, success, and error states
3. **Preserve State**: Don't lose user selections on errors
4. **Smooth Transitions**: Animate between steps
5. **Mobile First**: Optimize for mobile devices
6. **Accessibility**: Support all users
7. **Error Recovery**: Provide clear recovery paths

