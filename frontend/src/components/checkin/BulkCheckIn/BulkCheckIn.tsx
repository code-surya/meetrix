import { useState } from 'react';
import { Event } from '@/features/events/eventsTypes';
import { useCheckIn } from '@/hooks/useCheckIn';
import { Loading } from '@/components/common/Loading/Loading';
import './BulkCheckIn.css';

interface BulkCheckInProps {
  event: Event;
  onBulkCheckIn: (bookingReferences: string[], checkInMethod: string) => Promise<any>;
}

const BulkCheckIn = ({ event, onBulkCheckIn }: BulkCheckInProps) => {
  const [bookingReferences, setBookingReferences] = useState('');
  const [checkInMethod, setCheckInMethod] = useState('manual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const references = bookingReferences
      .split('\n')
      .map(ref => ref.trim())
      .filter(ref => ref.length > 0);

    if (references.length === 0) {
      setResult({ success: false, message: 'Please enter at least one booking reference' });
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      const response = await onBulkCheckIn(references, checkInMethod);
      setResult(response);

      if (response.success) {
        setBookingReferences('');
      }
    } catch (error: any) {
      setResult({
        success: false,
        message: error.response?.data?.error?.message || 'Bulk check-in failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClear = () => {
    setBookingReferences('');
    setResult(null);
  };

  return (
    <div className="bulk-check-in">
      <div className="bulk-header">
        <h3>Bulk Check-in</h3>
        <p className="bulk-description">
          Check in multiple attendees at once by entering their booking references.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bulk-form">
        <div className="form-group">
          <label htmlFor="booking-references">Booking References</label>
          <textarea
            id="booking-references"
            value={bookingReferences}
            onChange={(e) => setBookingReferences(e.target.value)}
            placeholder="Enter booking references (one per line):&#10;ABC123&#10;DEF456&#10;GHI789"
            rows={8}
            required
            disabled={isProcessing}
          />
          <small className="help-text">
            Enter one booking reference per line. References are case-sensitive.
          </small>
        </div>

        <div className="form-group">
          <label htmlFor="check-in-method">Check-in Method</label>
          <select
            id="check-in-method"
            value={checkInMethod}
            onChange={(e) => setCheckInMethod(e.target.value)}
            disabled={isProcessing}
          >
            <option value="manual">Manual Entry</option>
            <option value="list">Bulk List</option>
            <option value="api">API Import</option>
            <option value="csv">CSV Upload</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleClear}
            disabled={isProcessing}
          >
            Clear
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isProcessing || !bookingReferences.trim()}
          >
            {isProcessing ? (
              <>
                <Loading size="small" />
                Processing...
              </>
            ) : (
              'Check In Attendees'
            )}
          </button>
        </div>
      </form>

      {result && (
        <div className={`bulk-result ${result.success ? 'success' : 'error'}`}>
          <div className="result-header">
            <h4>{result.success ? '✅ Success' : '❌ Error'}</h4>
          </div>

          <div className="result-content">
            <p className="result-message">{result.message}</p>

            {result.results && result.results.length > 0 && (
              <div className="result-details">
                <h5>Results:</h5>
                <div className="results-list">
                  {result.results.map((item: any, index: number) => (
                    <div key={index} className={`result-item ${item.status}`}>
                      <span className="booking-ref">{item.booking_reference}</span>
                      <span className="status">
                        {item.status === 'success' ? '✅ Checked In' :
                         item.status === 'partial' ? '⚠️ Partial' :
                         '❌ Failed'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bulk-info">
        <div className="info-section">
          <h4>Instructions</h4>
          <ul>
            <li>Enter booking references one per line</li>
            <li>References are case-sensitive and must match exactly</li>
            <li>Only confirmed bookings can be checked in</li>
            <li>Already checked-in attendees will be skipped</li>
            <li>Use appropriate check-in method for tracking</li>
          </ul>
        </div>

        <div className="info-section">
          <h4>Bulk Check-in Methods</h4>
          <dl>
            <dt>Manual Entry</dt>
            <dd>Standard check-in for walk-ins or manual processing</dd>

            <dt>Bulk List</dt>
            <dd>Pre-approved list of attendees (e.g., VIP guests)</dd>

            <dt>API Import</dt>
            <dd>Automated check-in from external systems</dd>

            <dt>CSV Upload</dt>
            <dd>Import attendee list from spreadsheet</dd>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default BulkCheckIn;

