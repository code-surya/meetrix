import { useEffect } from 'react';
import { CheckInResult } from '@/hooks/useCheckIn';
import './AttendeeInfo.css';

interface AttendeeInfoProps {
  result: CheckInResult;
  onDismiss: () => void;
}

const AttendeeInfo = ({ result, onDismiss }: AttendeeInfoProps) => {
  useEffect(() => {
    if (result.success) {
      // Auto-dismiss after 5 seconds for success
      const timer = setTimeout(() => {
        onDismiss();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [result.success, onDismiss]);

  return (
    <div className={`attendee-info ${result.success ? 'success' : 'error'}`}>
      <div className="info-header">
        <div className="status-icon">
          {result.success ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
              <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" />
              <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </div>
        <div className="info-content">
          <h3 className="status-title">
            {result.success ? 'Check-in Successful!' : 'Check-in Failed'}
          </h3>
          <p className="status-message">{result.message}</p>
        </div>
        <button className="dismiss-btn" onClick={onDismiss} aria-label="Dismiss">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {result.success && result.attendee && (
        <div className="attendee-details">
          <div className="detail-grid">
            <div className="detail-item">
              <span className="detail-label">Attendee:</span>
              <span className="detail-value">{result.attendee.name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Ticket Type:</span>
              <span className="detail-value">{result.attendee.ticket_type}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Booking Ref:</span>
              <span className="detail-value booking-ref">{result.attendee.booking_reference}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Ticket #:</span>
              <span className="detail-value">{result.attendee.ticket_number}</span>
            </div>
            {result.checked_in_at && (
              <div className="detail-item">
                <span className="detail-label">Checked In:</span>
                <span className="detail-value">
                  {new Date(result.checked_in_at).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            )}
            {result.checked_in_by && (
              <div className="detail-item">
                <span className="detail-label">By:</span>
                <span className="detail-value">{result.checked_in_by}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {result.success && (
        <div className="success-actions">
          <p className="success-note">
            Attendee has been successfully checked in. They can now enter the event.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendeeInfo;

