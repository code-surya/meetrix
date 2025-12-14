import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePayment } from '@/hooks/usePayments';
import { Loading } from '@/components/common/Loading/Loading';
import { ErrorMessage } from '@/components/common/ErrorMessage/ErrorMessage';
import { formatCurrency } from '@/utils/formatters';
import './PaymentRedirect.css';

interface PaymentRedirectProps {
  booking: any;
  total: number;
  onSuccess: () => void;
  onError: (error: string) => void;
}

const PaymentRedirect = ({ booking, total, onSuccess, onError }: PaymentRedirectProps) => {
  const navigate = useNavigate();
  const [paymentIntent, setPaymentIntent] = useState<any>(null);
  const [gateway, setGateway] = useState<'stripe' | 'razorpay'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    createPaymentIntent,
    isLoading: isPaymentLoading,
    error: paymentError,
  } = usePayment();

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const result = await createPaymentIntent({
          bookingId: booking.id,
          gateway,
        });

        if (result.success && result.payment_intent) {
          setPaymentIntent(result.payment_intent);
        } else {
          onError(result.error || 'Failed to initialize payment');
        }
      } catch (error: any) {
        onError(error.message || 'An error occurred');
      }
    };

    if (booking) {
      initializePayment();
    }
  }, [booking, gateway]);

  const handleStripePayment = async () => {
    if (!paymentIntent?.client_secret) {
      onError('Payment not initialized');
      return;
    }

    setIsProcessing(true);

    try {
      // Initialize Stripe
      const stripe = (window as any).Stripe?.(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      
      if (!stripe) {
        throw new Error('Stripe not loaded');
      }

      // Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({
        sessionId: paymentIntent.payment_intent_id,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      setIsProcessing(false);
      onError(error.message || 'Payment failed');
    }
  };

  const handleRazorpayPayment = () => {
    if (!paymentIntent?.order_id || !paymentIntent?.key_id) {
      onError('Payment not initialized');
      return;
    }

    setIsProcessing(true);

    try {
      const options = {
        key: paymentIntent.key_id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        order_id: paymentIntent.order_id,
        name: 'Meetrix',
        description: `Payment for booking ${booking.booking_reference}`,
        handler: async (response: any) => {
          // Payment successful - will be handled by webhook
          onSuccess();
        },
        prefill: {
          name: booking.user?.name || '',
          email: booking.user?.email || '',
        },
        theme: {
          color: '#007bff',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      setIsProcessing(false);
      onError(error.message || 'Payment failed');
    }
  };

  if (isPaymentLoading || !paymentIntent) {
    return (
      <div className="payment-redirect-loading">
        <Loading size="large" />
        <p>Initializing payment...</p>
      </div>
    );
  }

  if (paymentError) {
    return (
      <ErrorMessage
        message={paymentError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="payment-redirect">
      <div className="payment-header">
        <h2>Complete Payment</h2>
        <p className="payment-amount">{formatCurrency(total)}</p>
      </div>

      <div className="payment-booking-info">
        <div className="info-row">
          <span>Booking Reference:</span>
          <span className="booking-ref">{booking.booking_reference}</span>
        </div>
        <div className="info-row">
          <span>Event:</span>
          <span>{booking.event?.title}</span>
        </div>
        <div className="info-row">
          <span>Total Tickets:</span>
          <span>{booking.total_tickets}</span>
        </div>
      </div>

      <div className="payment-gateway-selector">
        <h3>Select Payment Method</h3>
        <div className="gateway-options">
          <label className={`gateway-option ${gateway === 'stripe' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="gateway"
              value="stripe"
              checked={gateway === 'stripe'}
              onChange={(e) => setGateway(e.target.value as 'stripe')}
            />
            <div className="gateway-info">
              <span className="gateway-name">Stripe</span>
              <span className="gateway-desc">Credit/Debit Cards</span>
            </div>
          </label>
          <label className={`gateway-option ${gateway === 'razorpay' ? 'selected' : ''}`}>
            <input
              type="radio"
              name="gateway"
              value="razorpay"
              checked={gateway === 'razorpay'}
              onChange={(e) => setGateway(e.target.value as 'razorpay')}
            />
            <div className="gateway-info">
              <span className="gateway-name">Razorpay</span>
              <span className="gateway-desc">Cards, UPI, Wallets</span>
            </div>
          </label>
        </div>
      </div>

      <div className="payment-actions">
        <button
          className="btn-payment"
          onClick={gateway === 'stripe' ? handleStripePayment : handleRazorpayPayment}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loading size="small" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(total)}`
          )}
        </button>
        <p className="payment-security">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M8 1L10.163 5.607L15 6.236L12 9.764L12.944 15L8 13.107L3.056 15L4 9.764L1 6.236L5.837 5.607L8 1Z"
              fill="currentColor"
            />
          </svg>
          Secure payment powered by {gateway === 'stripe' ? 'Stripe' : 'Razorpay'}
        </p>
      </div>

      <div className="payment-terms">
        <p>
          By proceeding, you agree to our Terms of Service and Privacy Policy.
          Your payment is secure and encrypted.
        </p>
      </div>
    </div>
  );
};

export default PaymentRedirect;

