import { Link } from 'react-router-dom';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { Event } from '@/features/events/eventsTypes';
import './EventCard.css';

interface EventCardProps {
  event: Event;
}

const EventCard = ({ event }: EventCardProps) => {
  const imageUrl = event.image_url || event.banner_url || '/placeholder-event.jpg';
  const minPrice = event.statistics?.min_price || 0;
  const maxPrice = event.statistics?.max_price || 0;
  const priceRange = minPrice === maxPrice 
    ? formatCurrency(minPrice) 
    : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;

  return (
    <Link to={`/events/${event.id}`} className="event-card">
      <div className="event-card-image">
        <img src={imageUrl} alt={event.title} loading="lazy" />
        {event.featured && (
          <span className="featured-badge">Featured</span>
        )}
        {event.status === 'cancelled' && (
          <span className="cancelled-badge">Cancelled</span>
        )}
      </div>

      <div className="event-card-content">
        <div className="event-card-header">
          <span className="event-category">{event.category}</span>
          {event.statistics?.average_rating > 0 && (
            <div className="event-rating">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M8 0L10.163 5.607L16 6.236L12 9.764L12.944 16L8 13.107L3.056 16L4 9.764L0 6.236L5.837 5.607L8 0Z" />
              </svg>
              <span>{event.statistics.average_rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <h3 className="event-card-title">{event.title}</h3>

        <div className="event-card-details">
          <div className="event-detail-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M8 1V3M8 13V15M3 8H1M15 8H13M4.343 4.343L3.222 3.222M12.778 12.778L11.657 11.657M4.343 11.657L3.222 12.778M12.778 3.222L11.657 4.343"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="8" cy="8" r="5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>{formatDate(event.start_date)}</span>
          </div>

          <div className="event-detail-item">
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
            <span>{event.venue.city}, {event.venue.country}</span>
          </div>

          <div className="event-detail-item">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <path d="M1 7H15" stroke="currentColor" strokeWidth="1.5" />
              <path d="M5 1V4M11 1V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>{priceRange}</span>
          </div>
        </div>

        {event.statistics && (
          <div className="event-card-stats">
            <span className="stat-item">
              {event.statistics.total_tickets_sold} sold
            </span>
            {event.statistics.available_tickets > 0 && (
              <span className="stat-item">
                {event.statistics.available_tickets} available
              </span>
            )}
            {event.statistics.available_tickets === 0 && (
              <span className="stat-item sold-out">Sold Out</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
};

export default EventCard;

