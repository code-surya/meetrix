import { useState, useEffect } from 'react';
import { Event } from '@/features/events/eventsTypes';
import { usePayments } from '@/hooks/usePayments';
import { Loading } from '@/components/common/Loading/Loading';
import { ErrorMessage } from '@/components/common/ErrorMessage/ErrorMessage';
import './PaymentStep.css';

interface BookingState {
  tickets: any[];
  groupId: number | null;
  totalAmount: number;
  discountAmount: number;
  discountPercentage: number;
}

interface PaymentStepProps {
  bookingState: BookingState;
  event: Event;
  onPaymentSuccess: () => void;
  isProcessing: boolean;
}

const PaymentStep = ({
  bookingState,
  event,
  onPaymentSuccess,
  isProcessing,
}: PaymentStepProps) => {
  const { createPaymentIntent, confirmPayment } = usePayments();
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay'>('stripe');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  // Create payment intent when component mounts
  useEffect(() => {
    if (bookingState.totalAmount > 0) {
      handleCreatePaymentIntent();
    }
  }, []);

  const handleCreatePaymentIntent = async () => {
    setIsLoading(true);
    setError('');

    try {
      // This would typically be called after booking is created
      // For now, we'll simulate it
      const result = await createPaymentIntent({
        amount: bookingState.totalAmount,
        currency: 'USD',
        gateway: paymentMethod,
      });

      if (result.success) {
        setPaymentIntent(result.payment_intent);
      } else {
        setError(result.error || 'Failed to initialize payment');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentIntent) {
      setError('Payment not initialized. Please try again.');
      return;
    }

    setIsPaymentProcessing(true);
    setError('');

    try {
      // In a real implementation, this would redirect to payment gateway
      // or use Stripe.js/Razorpay SDK for client-side payment
      
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // After successful payment, confirm and complete booking
      onPaymentSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  return (
    <div className="payment-step">
      <div className="step-header">
        <h3>Payment</h3>
        <p className="step-description">
          Complete your booking by making a secure payment
        </p>
      </div>

      {error && (
        <div className="payment-error">
          <ErrorMessage message={error} />
        </div>
      )}

      <div className="payment-summary">
        <div className="summary-row">
          <span>Event</span>
          <span className="summary-value">{event.title}</span>
        </div>
        <div className="summary-row">
          <span>Total Tickets</span>
          <span className="summary-value">
            {bookingState.tickets.reduce((sum, t) => sum + t.quantity, 0)}
          </span>
        </div>
        <div className="summary-row">
          <span>Total Amount</span>
          <span className="summary-value total-amount">
            ${bookingState.totalAmount.toFixed(2)}
          </span>
        </div>
        {bookingState.discountPercentage > 0 && (
          <div className="summary-row discount">
            <span>Discount ({bookingState.discountPercentage}%)</span>
            <span className="summary-value discount-value">
              -${bookingState.discountAmount.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      <div className="payment-methods">
        <h4>Select Payment Method</h4>
        <div className="payment-method-options">
          <label className={`payment-method-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="stripe"
              checked={paymentMethod === 'stripe'}
              onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
            />
            <div className="payment-method-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M6 10H8M14 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Credit/Debit Card</span>
            </div>
          </label>

          <label className={`payment-method-option ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="paymentMethod"
              value="razorpay"
              checked={paymentMethod === 'razorpay'}
              onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
            />
            <div className="payment-method-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="6" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M6 10H8M14 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span>Razorpay</span>
            </div>
          </label>
        </div>
      </div>

      {isLoading && (
        <div className="payment-loading">
          <Loading />
          <p>Initializing payment...</p>
        </div>
      )}

      {paymentIntent && (
        <div className="payment-ready">
          <div className="payment-ready-badge">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" />
              <path
                d="M6 10L9 13L14 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Payment ready</span>
          </div>
        </div>
      )}

      <div className="payment-security">
        <div className="security-features">
          <div className="security-feature">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1L3 4V8C3 12.55 6.16 16.74 10 18C13.84 16.74 17 12.55 17 8V4L10 1Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>SSL Encrypted</span>
          </div>
          <div className="security-feature">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 8C9.10457 8 10 7.10457 10 6C10 4.89543 9.10457 4 8 4C6.89543 4 6 4.89543 6 6C6 7.10457 6.89543 8 8 8Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8 1C5.23858 1 3 3.23858 3 6C3 9.5 8 15 8 15C8 15 13 9.5 13 6C13 3.23858 10.7614 1 8 1Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <span>Secure Payment</span>
          </div>
        </div>
      </div>

      <div className="payment-actions">
        <button
          className="btn-primary payment-btn"
          onClick={handlePayment}
          disabled={isLoading || isPaymentProcessing || isProcessing || !paymentIntent}
        >
          {isPaymentProcessing || isProcessing ? (
            <>
              <Loading size="small" />
              Processing Payment...
            </>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M16 6L8 14L4 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Complete Payment
            </>
          )}
        </button>
        <p className="payment-note">
          By completing this payment, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default PaymentStep;

