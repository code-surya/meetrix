import { Event } from '@/features/events/eventsTypes';
import { formatCurrency } from '@/utils/formatters';
import './PriceBreakdown.css';

interface PriceBreakdownProps {
  event: Event;
  selectedTickets: Record<number, number>;
  subtotal: number;
  discount: number;
  total: number;
  groupBooking: {
    enabled: boolean;
    groupId: number | null;
  };
}

const PriceBreakdown = ({
  event,
  selectedTickets,
  subtotal,
  discount,
  total,
  groupBooking,
}: PriceBreakdownProps) => {
  const ticketDetails = Object.entries(selectedTickets)
    .map(([ticketTypeId, quantity]) => {
      const ticketType = event.ticket_types?.find(
        (tt) => tt.id === parseInt(ticketTypeId)
      );
      if (!ticketType) return null;

      return {
        name: ticketType.name,
        quantity,
        unitPrice: ticketType.price,
        subtotal: ticketType.price * quantity,
      };
    })
    .filter(Boolean);

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="price-breakdown">
      <div className="breakdown-header">
        <h2>Booking Summary</h2>
        <div className="event-info">
          <h3>{event.title}</h3>
          <p className="event-date">
            {new Date(event.start_date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
          <p className="event-venue">
            {event.venue.name}, {event.venue.city}
          </p>
        </div>
      </div>

      <div className="breakdown-content">
        <div className="ticket-details">
          <h3>Tickets</h3>
          <div className="ticket-list">
            {ticketDetails.map((ticket, index) => (
              <div key={index} className="ticket-row">
                <div className="ticket-info">
                  <span className="ticket-name">{ticket?.name}</span>
                  <span className="ticket-quantity">× {ticket?.quantity}</span>
                </div>
                <div className="ticket-price">
                  {ticket && formatCurrency(ticket.subtotal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="price-calculations">
          <div className="price-row">
            <span>Subtotal ({totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'}):</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          {groupBooking.enabled && discount > 0 && (
            <>
              <div className="price-row discount-row">
                <span>
                  Group Discount ({groupBooking.groupId ? 'Applied' : 'Estimated'}):
                </span>
                <span className="discount-amount">-{formatCurrency(discount)}</span>
              </div>
              <div className="discount-note">
                Discount will be applied when all group members complete their bookings
              </div>
            </>
          )}

          <div className="price-row total-row">
            <span>Total:</span>
            <span className="total-amount">{formatCurrency(total)}</span>
          </div>
        </div>

        {groupBooking.enabled && (
          <div className="group-booking-note">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M10 6V10M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p>
              You're booking as part of a group. The discount will be confirmed once all members complete their bookings.
            </p>
          </div>
        )}

        <div className="booking-terms">
          <h4>Important Information</h4>
          <ul>
            <li>Tickets are non-refundable unless the event is cancelled</li>
            <li>All sales are final</li>
            <li>Please arrive 15 minutes before the event starts</li>
            <li>QR codes will be sent to your email after payment confirmation</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PriceBreakdown;
