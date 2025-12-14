import { useEffect, useRef, useCallback } from 'react';
import EventCard from '@/components/events/EventCard/EventCard';
import { Loading } from '@/components/common/Loading/Loading';
import { Event } from '@/features/events/eventsTypes';
import './EventList.css';

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  pagination?: {
    current_page: number;
    total_pages: number;
    has_next_page: boolean;
  };
  onLoadMore: () => void;
  hasMore: boolean;
}

const EventList = ({ events, isLoading, pagination, onLoadMore, hasMore }: EventListProps) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Infinite scroll implementation
  const lastEventElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          onLoadMore();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, onLoadMore]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  if (events.length === 0 && !isLoading) {
    return (
      <div className="event-list-empty">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
          <path
            d="M32 20V32L40 40"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <h3>No events found</h3>
        <p>Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="event-list-container">
      <div className="event-list-grid">
        {events.map((event, index) => (
          <div
            key={event.id}
            ref={index === events.length - 1 ? lastEventElementRef : null}
          >
            <EventCard event={event} />
          </div>
        ))}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="event-list-loading">
          <Loading />
          <p>Loading more events...</p>
        </div>
      )}

      {/* Load more button (alternative to infinite scroll) */}
      {!isLoading && hasMore && (
        <div className="event-list-load-more" ref={loadMoreRef}>
          <button
            className="load-more-btn"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            Load More Events
          </button>
        </div>
      )}

      {/* End of results */}
      {!hasMore && events.length > 0 && (
        <div className="event-list-end">
          <p>You've reached the end of the results</p>
        </div>
      )}

      {/* Pagination info */}
      {pagination && (
        <div className="event-list-pagination-info">
          Page {pagination.current_page} of {pagination.total_pages}
        </div>
      )}
    </div>
  );
};

export default EventList;

