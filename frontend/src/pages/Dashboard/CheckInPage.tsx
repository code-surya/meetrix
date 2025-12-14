import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container } from '@/components/layout/Container/Container';
import { Loading } from '@/components/common/Loading/Loading';
import { ErrorMessage } from '@/components/common/ErrorMessage/ErrorMessage';
import QrScanner from '@/components/checkin/QrScanner/QrScanner';
import AttendeeInfo from '@/components/checkin/AttendeeInfo/AttendeeInfo';
import AttendanceStats from '@/components/checkin/AttendanceStats/AttendanceStats';
import BulkCheckIn from '@/components/checkin/BulkCheckIn/BulkCheckIn';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useEvent } from '@/hooks/useEvents';
import { useWebSocket } from '@/hooks/useWebSocket';
import './CheckInPage.css';

const CheckInPage = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const [activeTab, setActiveTab] = useState<'scanner' | 'bulk' | 'stats'>('scanner');
  const [attendanceData, setAttendanceData] = useState<any>(null);

  const { event, isLoading: eventLoading, error: eventError } = useEvent(eventId);
  const { isConnected } = useWebSocket(true);

  const {
    verifyQrCode,
    checkInAttendee,
    bulkCheckIn,
    clearResult,
    isVerifying,
    isCheckingIn,
    lastResult,
  } = useCheckIn(eventId!);

  useEffect(() => {
    if (event && lastResult?.success) {
      // Clear result after 5 seconds on success
      const timer = setTimeout(() => {
        clearResult();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [lastResult, clearResult, event]);

  const handleQrScan = async (qrData: string) => {
    try {
      const verificationResult = await verifyQrCode(qrData);

      if (verificationResult.success && verificationResult.attendee) {
        // Auto-check in if QR is valid and not already checked in
        const bookingItemId = JSON.parse(qrData).booking_item_id;
        await checkInAttendee(bookingItemId, qrData);
      }
    } catch (error) {
      console.error('QR scan processing failed:', error);
    }
  };

  const handleManualCheckIn = async (bookingItemId: number, qrData: string) => {
    await checkInAttendee(bookingItemId, qrData);
  };

  if (eventLoading) {
    return (
      <Container>
        <div className="check-in-loading">
          <Loading size="large" />
          <p>Loading event details...</p>
        </div>
      </Container>
    );
  }

  if (eventError || !event) {
    return (
      <Container>
        <ErrorMessage
          message="Failed to load event details"
          onRetry={() => window.location.reload()}
        />
      </Container>
    );
  }

  return (
    <Container>
      <div className="check-in-page">
        <div className="check-in-header">
          <div className="event-info">
            <h1>Check-in: {event.title}</h1>
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
              {event.venue?.name || event.venue_name}, {event.venue?.city}
            </p>
          </div>

          <div className="connection-status">
            <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? '🟢' : '🔴'} {isConnected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="check-in-tabs">
          <button
            className={`tab-button ${activeTab === 'scanner' ? 'active' : ''}`}
            onClick={() => setActiveTab('scanner')}
          >
            QR Scanner
          </button>
          <button
            className={`tab-button ${activeTab === 'bulk' ? 'active' : ''}`}
            onClick={() => setActiveTab('bulk')}
          >
            Bulk Check-in
          </button>
          <button
            className={`tab-button ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            Attendance Stats
          </button>
        </div>

        <div className="check-in-content">
          {activeTab === 'scanner' && (
            <div className="scanner-section">
              <QrScanner
                event={event}
                onScan={handleQrScan}
                onManualCheckIn={handleManualCheckIn}
              />

              {lastResult && (
                <div className="scan-result">
                  <AttendeeInfo
                    result={lastResult}
                    onDismiss={clearResult}
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'bulk' && (
            <BulkCheckIn
              event={event}
              onBulkCheckIn={bulkCheckIn}
            />
          )}

          {activeTab === 'stats' && (
            <AttendanceStats
              event={event}
              attendanceData={attendanceData}
            />
          )}
        </div>

        {/* Loading overlay for operations */}
        {(isVerifying || isCheckingIn) && (
          <div className="loading-overlay">
            <div className="loading-content">
              <Loading size="large" />
              <p>{isVerifying ? 'Verifying QR code...' : 'Checking in attendee...'}</p>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default CheckInPage;

