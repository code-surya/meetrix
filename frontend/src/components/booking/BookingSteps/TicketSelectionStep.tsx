import { useState } from 'react';
import { Event } from '@/features/events/eventsTypes';
import { formatCurrency } from '@/utils/formatters';
import './TicketSelectionStep.css';

interface TicketSelection {
  ticket_type_id: number;
  quantity: number;
  name: string;
  price: number;
}

interface TicketSelectionStepProps {
  event: Event;
  selectedTickets: TicketSelection[];
  onTicketChange: (ticketTypeId: number, quantity: number) => void;
  errors: Record<string, string>;
}

const TicketSelectionStep = ({
  event,
  selectedTickets,
  onTicketChange,
  errors,
}: TicketSelectionStepProps) => {
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());

  const toggleExpand = (ticketTypeId: number) => {
    setExpandedTickets((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ticketTypeId)) {
        newSet.delete(ticketTypeId);
      } else {
        newSet.add(ticketTypeId);
      }
      return newSet;
    });
  };

  const getSelectedQuantity = (ticketTypeId: number): number => {
    const selected = selectedTickets.find((t) => t.ticket_type_id === ticketTypeId);
    return selected?.quantity || 0;
  };

  const handleQuantityChange = (ticketTypeId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    onTicketChange(ticketTypeId, newQuantity);
  };

  if (!event.ticket_types || event.ticket_types.length === 0) {
    return (
      <div className="ticket-selection-empty">
        <p>No tickets available for this event.</p>
      </div>
    );
  }

  return (
    <div className="ticket-selection-step">
      <div className="step-header">
        <h3>Select Your Tickets</h3>
        <p className="step-description">
          Choose the number of tickets for each ticket type
        </p>
      </div>

      {errors.tickets && (
        <div className="ticket-error-message">
          {errors.tickets}
        </div>
      )}

      <div className="ticket-types-list">
        {event.ticket_types
          .filter((tt) => tt.on_sale)
          .map((ticketType) => {
            const selectedQuantity = getSelectedQuantity(ticketType.id);
            const isExpanded = expandedTickets.has(ticketType.id);
            const error = errors[`ticket_${ticketType.id}`];
            const isSoldOut = ticketType.available_quantity === 0;

            return (
              <div
                key={ticketType.id}
                className={`ticket-type-card ${selectedQuantity > 0 ? 'selected' : ''} ${
                  isSoldOut ? 'sold-out' : ''
                }`}
              >
                <div className="ticket-type-header" onClick={() => toggleExpand(ticketType.id)}>
                  <div className="ticket-type-info">
                    <h4 className="ticket-type-name">{ticketType.name}</h4>
                    <div className="ticket-type-meta">
                      <span className="ticket-price">{formatCurrency(ticketType.price)}</span>
                      {ticketType.description && (
                        <span className="ticket-description">{ticketType.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="ticket-type-availability">
                    {isSoldOut ? (
                      <span className="sold-out-badge">Sold Out</span>
                    ) : (
                      <span className="available-badge">
                        {ticketType.available_quantity} available
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && ticketType.description && (
                  <div className="ticket-type-details">
                    <p>{ticketType.description}</p>
                    <div className="ticket-sale-dates">
                      <span>
                        Sale starts: {new Date(ticketType.sale_start_date).toLocaleDateString()}
                      </span>
                      <span>
                        Sale ends: {new Date(ticketType.sale_end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {!isSoldOut && (
                  <div className="ticket-quantity-selector">
                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(ticketType.id, selectedQuantity - 1)}
                      disabled={selectedQuantity === 0}
                      aria-label="Decrease quantity"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M4 10H16"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>

                    <div className="quantity-display">
                      <input
                        type="number"
                        min="0"
                        max={ticketType.available_quantity}
                        value={selectedQuantity}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          handleQuantityChange(
                            ticketType.id,
                            Math.min(value, ticketType.available_quantity)
                          );
                        }}
                        className="quantity-input"
                        aria-label={`Quantity for ${ticketType.name}`}
                      />
                      <span className="quantity-label">tickets</span>
                    </div>

                    <button
                      className="quantity-btn"
                      onClick={() => handleQuantityChange(ticketType.id, selectedQuantity + 1)}
                      disabled={selectedQuantity >= ticketType.available_quantity}
                      aria-label="Increase quantity"
                    >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path
                          d="M10 4V16M4 10H16"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                )}

                {error && (
                  <div className="ticket-field-error">{error}</div>
                )}

                {selectedQuantity > 0 && (
                  <div className="ticket-subtotal">
                    Subtotal: {formatCurrency(ticketType.price * selectedQuantity)}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {selectedTickets.length > 0 && (
        <div className="ticket-selection-summary">
          <h4>Selected Tickets</h4>
          <div className="selected-tickets-list">
            {selectedTickets.map((ticket) => (
              <div key={ticket.ticket_type_id} className="selected-ticket-item">
                <span>{ticket.name}</span>
                <span>
                  {ticket.quantity} × {formatCurrency(ticket.price)} ={' '}
                  {formatCurrency(ticket.price * ticket.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketSelectionStep;

