import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBooking } from '@/hooks/useBookings';
import { Loading } from '@/components/common/Loading/Loading';
import { ErrorMessage } from '@/components/common/ErrorMessage/ErrorMessage';
import { Container } from '@/components/layout/Container/Container';
import { formatDate, formatCurrency } from '@/utils/formatters';
import './BookingConfirmationPage.css';

const BookingConfirmationPage = () => {
  const { id: bookingId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { booking, isLoading, error, confirmBooking } = useBooking(bookingId);
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    if (booking && booking.status === 'pending') {
      // Auto-confirm if payment was successful
      handleConfirmBooking();
    }
  }, [booking]);

  const handleConfirmBooking = async () => {
    if (!booking || booking.status !== 'pending') return;

    setIsConfirming(true);
    try {
      const result = await confirmBooking(booking.id);
      if (!result.success) {
        console.error('Failed to confirm booking:', result.error);
      }
    } catch (error) {
      console.error('Error confirming booking:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  if (isLoading || isConfirming) {
    return (
      <Container>
        <div className="confirmation-loading">
          <Loading size="large" />
          <p>Confirming your booking...</p>
        </div>
      </Container>
    );
  }

  if (error || !booking) {
    return (
      <Container>
        <ErrorMessage
          message="Failed to load booking details. Please try again."
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  const isConfirmed = booking.status === 'confirmed';

  return (
    <Container>
      <div className="booking-confirmation">
        <div className={`confirmation-status ${isConfirmed ? 'success' : 'pending'}`}>
          {isConfirmed ? (
            <>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3" />
                <path
                  d="M20 32L28 40L44 24"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <h1>Booking Confirmed!</h1>
              <p>Your tickets have been confirmed. Check your email for details.</p>
            </>
          ) : (
            <>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="3" />
                <path
                  d="M32 20V32L40 40"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <h1>Booking Pending</h1>
              <p>Your booking is being processed. Please wait...</p>
            </>
          )}
        </div>

        <div className="confirmation-details">
          <div className="detail-card">
            <h2>Booking Details</h2>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">Booking Reference</span>
                <span className="detail-value booking-ref">{booking.booking_reference}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className={`detail-value status-badge status-${booking.status}`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Amount</span>
                <span className="detail-value amount">{formatCurrency(booking.total_amount)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Total Tickets</span>
                <span className="detail-value">{booking.total_tickets}</span>
              </div>
            </div>
          </div>

          {booking.event && (
            <div className="detail-card">
              <h2>Event Information</h2>
              <div className="event-summary">
                <h3>{booking.event.title}</h3>
                <p className="event-date">
                  {formatDate(booking.event.start_date)}
                </p>
                <p className="event-venue">
                  {booking.event.venue?.name || booking.event.venue_name}
                  {booking.event.venue?.city && `, ${booking.event.venue.city}`}
                </p>
              </div>
            </div>
          )}

          {booking.booking_items && booking.booking_items.length > 0 && (
            <div className="detail-card">
              <h2>Tickets</h2>
              <div className="tickets-list">
                {booking.booking_items.map((item: any, index: number) => (
                  <div key={index} className="ticket-item">
                    <div className="ticket-info">
                      <span className="ticket-name">{item.ticket_type?.name}</span>
                      <span className="ticket-quantity">× {item.quantity}</span>
                    </div>
                    <div className="ticket-price">
                      {formatCurrency(item.subtotal)}
                    </div>
                  </div>
                ))}
              </div>

              {booking.booking_items.some((item: any) => item.qr_codes?.length > 0) && (
                <div className="qr-codes-section">
                  <h3>Your QR Codes</h3>
                  <p>Show these QR codes at the event entrance</p>
                  <div className="qr-codes-grid">
                    {booking.booking_items.map((item: any, itemIndex: number) =>
                      item.qr_codes?.map((qr: any, qrIndex: number) => (
                        <div key={`${itemIndex}-${qrIndex}`} className="qr-code-item">
                          <img
                            src={`data:image/png;base64,${qr.image_base64}`}
                            alt={`QR Code ${qrIndex + 1}`}
                            className="qr-code-image"
                          />
                          <p className="qr-code-label">
                            {item.ticket_type?.name} - Ticket {qrIndex + 1}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {booking.payment && (
            <div className="detail-card">
              <h2>Payment Information</h2>
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Payment Status</span>
                  <span className={`detail-value status-badge status-${booking.payment.status}`}>
                    {booking.payment.status.charAt(0).toUpperCase() + booking.payment.status.slice(1)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Amount Paid</span>
                  <span className="detail-value">{formatCurrency(booking.payment.amount)}</span>
                </div>
                {booking.payment.transaction_id && (
                  <div className="detail-item">
                    <span className="detail-label">Transaction ID</span>
                    <span className="detail-value transaction-id">{booking.payment.transaction_id}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="confirmation-actions">
          <Link to="/bookings" className="btn-secondary">
            View All Bookings
          </Link>
          {booking.event && (
            <Link to={`/events/${booking.event.id}`} className="btn-primary">
              View Event
            </Link>
          )}
          <button
            className="btn-primary"
            onClick={() => window.print()}
          >
            Print Confirmation
          </button>
        </div>
      </div>
    </Container>
  );
};

export default BookingConfirmationPage;
