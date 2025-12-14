import { useState } from 'react';
import './DateRangePicker.css';

interface DateRangePickerProps {
  onDateChange: (range: { start_date?: string; end_date?: string }) => void;
  onPeriodChange: (period: 'day' | 'week' | 'month') => void;
  selectedPeriod: 'day' | 'week' | 'month';
}

const DateRangePicker = ({
  onDateChange,
  onPeriodChange,
  selectedPeriod,
}: DateRangePickerProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setStartDate(date);
    onDateChange({ start_date: date, end_date: endDate || undefined });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value;
    setEndDate(date);
    onDateChange({ start_date: startDate || undefined, end_date: date });
  };

  const handleQuickSelect = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);
    onDateChange({ start_date: startStr, end_date: endStr });
  };

  return (
    <div className="date-range-picker">
      <div className="period-selector">
        <button
          className={`period-btn ${selectedPeriod === 'day' ? 'active' : ''}`}
          onClick={() => onPeriodChange('day')}
        >
          Day
        </button>
        <button
          className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
          onClick={() => onPeriodChange('week')}
        >
          Week
        </button>
        <button
          className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
          onClick={() => onPeriodChange('month')}
        >
          Month
        </button>
      </div>

      <div className="date-inputs">
        <input
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          className="date-input"
          placeholder="Start date"
        />
        <span className="date-separator">to</span>
        <input
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          className="date-input"
          placeholder="End date"
        />
      </div>

      <div className="quick-select">
        <button
          className="quick-btn"
          onClick={() => handleQuickSelect(7)}
        >
          Last 7 days
        </button>
        <button
          className="quick-btn"
          onClick={() => handleQuickSelect(30)}
        >
          Last 30 days
        </button>
        <button
          className="quick-btn"
          onClick={() => handleQuickSelect(90)}
        >
          Last 90 days
        </button>
      </div>
    </div>
  );
};

export default DateRangePicker;

