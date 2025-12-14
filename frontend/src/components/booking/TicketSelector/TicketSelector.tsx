import { useState } from 'react';
import { Event } from '@/features/events/eventsTypes';
import { formatCurrency } from '@/utils/formatters';
import './TicketSelector.css';

interface TicketSelectorProps {
  event: Event;
  selectedTickets: Record<number, number>;
  onTicketChange: (ticketTypeId: number, quantity: number) => void;
  errors: Record<string, string>;
}

const TicketSelector = ({
  event,
  selectedTickets,
  onTicketChange,
  errors,
}: TicketSelectorProps) => {
  const [expandedTickets, setExpandedTickets] = useState<Set<number>>(new Set());

  const toggleExpanded = (ticketTypeId: number) => {
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

  const handleQuantityChange = (ticketTypeId: number, delta: number) => {
    const currentQuantity = selectedTickets[ticketTypeId] || 0;
    const ticketType = event.ticket_types?.find((tt) => tt.id === ticketTypeId);
    
    if (!ticketType) return;

    const newQuantity = Math.max(0, Math.min(currentQuantity + delta, ticketType.available_quantity));
    onTicketChange(ticketTypeId, newQuantity);
  };

  const handleDirectInput = (ticketTypeId: number, value: string) => {
    const quantity = parseInt(value) || 0;
    const ticketType = event.ticket_types?.find((tt) => tt.id === ticketTypeId);
    
    if (!ticketType) return;

    const clampedQuantity = Math.max(0, Math.min(quantity, ticketType.available_quantity));
    onTicketChange(ticketTypeId, clampedQuantity);
  };

  if (!event.ticket_types || event.ticket_types.length === 0) {
    return (
      <div className="ticket-selector-empty">
        <p>No tickets available for this event.</p>
      </div>
    );
  }

  const totalTickets = Object.values(selectedTickets).reduce((sum, qty) => sum + qty, 0);

  return (
    <div className="ticket-selector">
      <div className="ticket-selector-header">
        <h2>Select Tickets</h2>
        {totalTickets > 0 && (
          <div className="ticket-count-badge">
            {totalTickets} {totalTickets === 1 ? 'ticket' : 'tickets'} selected
          </div>
        )}
      </div>

      {errors.tickets && (
        <div className="ticket-error-message">
          {errors.tickets}
        </div>
      )}

      <div className="ticket-list">
        {event.ticket_types
          .filter((tt) => tt.active && tt.on_sale)
          .map((ticketType) => {
            const quantity = selectedTickets[ticketType.id] || 0;
            const isExpanded = expandedTickets.has(ticketType.id);
            const isSoldOut = ticketType.available_quantity === 0;
            const error = errors[`ticket_${ticketType.id}`];

            return (
              <div
                key={ticketType.id}
                className={`ticket-item ${quantity > 0 ? 'selected' : ''} ${isSoldOut ? 'sold-out' : ''}`}
              >
                <div className="ticket-item-header" onClick={() => toggleExpanded(ticketType.id)}>
                  <div className="ticket-info">
                    <h3 className="ticket-name">{ticketType.name}</h3>
                    <div className="ticket-meta">
                      <span className="ticket-price">{formatCurrency(ticketType.price)}</span>
                      {ticketType.description && (
                        <span className="ticket-description">{ticketType.description}</span>
                      )}
                    </div>
                  </div>
                  <div className="ticket-availability">
                    {isSoldOut ? (
                      <span className="sold-out-badge">Sold Out</span>
                    ) : (
                      <span className="available-badge">
                        {ticketType.available_quantity} available
                      </span>
                    )}
                  </div>
                </div>

                {isExpanded && !isSoldOut && (
                  <div className="ticket-item-details">
                    <div className="ticket-quantity-controls">
                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(ticketType.id, -1)}
                        disabled={quantity === 0}
                        aria-label="Decrease quantity"
                      >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>

                      <input
                        type="number"
                        className="quantity-input"
                        min="0"
                        max={ticketType.available_quantity}
                        value={quantity}
                        onChange={(e) => handleDirectInput(ticketType.id, e.target.value)}
                        aria-label={`Quantity for ${ticketType.name}`}
                      />

                      <button
                        className="quantity-btn"
                        onClick={() => handleQuantityChange(ticketType.id, 1)}
                        disabled={quantity >= ticketType.available_quantity}
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

                    {quantity > 0 && (
                      <div className="ticket-subtotal">
                        Subtotal: {formatCurrency(ticketType.price * quantity)}
                      </div>
                    )}

                    {error && (
                      <div className="ticket-field-error">{error}</div>
                    )}
                  </div>
                )}

                {!isExpanded && !isSoldOut && (
                  <div className="ticket-quick-select">
                    <button
                      className="quick-select-btn"
                      onClick={() => {
                        setExpandedTickets((prev) => new Set(prev).add(ticketType.id));
                      }}
                    >
                      Select Quantity
                    </button>
                    {quantity > 0 && (
                      <span className="selected-quantity">{quantity} selected</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {totalTickets > 0 && (
        <div className="ticket-summary">
          <div className="summary-row">
            <span>Total Tickets:</span>
            <span className="summary-value">{totalTickets}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Estimated Total:</span>
            <span className="summary-value">
              {formatCurrency(
                Object.entries(selectedTickets).reduce((sum, [ticketTypeId, quantity]) => {
                  const ticketType = event.ticket_types?.find(
                    (tt) => tt.id === parseInt(ticketTypeId)
                  );
                  return sum + (ticketType?.price || 0) * quantity;
                }, 0)
              )}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketSelector;

