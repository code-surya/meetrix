import { useState } from 'react';
import './DateRangePicker.css';

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onChange: (start: Date, end: Date) => void;
  className?: string;
}

const DateRangePicker = ({
  startDate,
  endDate,
  onChange,
  className = ''
}: DateRangePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    onChange(newStartDate, endDate);
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    onChange(startDate, newEndDate);
  };

  const setQuickRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    onChange(start, end);
    setIsOpen(false);
  };

  const quickRanges = [
    { label: 'Last 7 days', days: 7 },
    { label: 'Last 30 days', days: 30 },
    { label: 'Last 90 days', days: 90 },
    { label: 'Last year', days: 365 },
  ];

  return (
    <div className={`date-range-picker ${className}`}>
      <button
        className="date-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
      >
        <span className="date-range-display">
          {formatDate(startDate)} - {formatDate(endDate)}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M4 6L8 10L12 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="date-picker-overlay" onClick={() => setIsOpen(false)} />
          <div className="date-picker-dropdown">
            <div className="quick-ranges">
              <h4>Quick Select</h4>
              {quickRanges.map((range) => (
                <button
                  key={range.days}
                  className="quick-range-btn"
                  onClick={() => setQuickRange(range.days)}
                  type="button"
                >
                  {range.label}
                </button>
              ))}
            </div>

            <div className="custom-range">
              <h4>Custom Range</h4>
              <div className="date-inputs">
                <div className="date-input-group">
                  <label htmlFor="start-date">Start Date</label>
                  <input
                    id="start-date"
                    type="date"
                    value={startDate.toISOString().split('T')[0]}
                    onChange={handleStartDateChange}
                    max={endDate.toISOString().split('T')[0]}
                  />
                </div>
                <div className="date-input-group">
                  <label htmlFor="end-date">End Date</label>
                  <input
                    id="end-date"
                    type="date"
                    value={endDate.toISOString().split('T')[0]}
                    onChange={handleEndDateChange}
                    min={startDate.toISOString().split('T')[0]}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DateRangePicker;

