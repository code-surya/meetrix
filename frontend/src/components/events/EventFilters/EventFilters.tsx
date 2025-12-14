import { useState } from 'react';
import './EventFilters.css';

interface EventFiltersProps {
  filters: any;
  onChange: (filters: any) => void;
  userLocation?: { latitude: number; longitude: number } | null;
  locationError?: GeolocationPositionError | null;
}

const EventFilters = ({ filters, onChange, userLocation, locationError }: EventFiltersProps) => {
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    start_date_from: filters.start_date_from || '',
    start_date_to: filters.start_date_to || '',
    min_price: filters.min_price || '',
    max_price: filters.max_price || '',
    latitude: filters.latitude || '',
    longitude: filters.longitude || '',
    radius: filters.radius || 10,
    upcoming: filters.upcoming ?? true,
  });

  const categories = [
    { value: '', label: 'All Categories' },
    { value: 'music', label: 'Music' },
    { value: 'sports', label: 'Sports' },
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'arts', label: 'Arts' },
    { value: 'food', label: 'Food & Drink' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'other', label: 'Other' },
  ];

  const handleChange = (field: string, value: any) => {
    const updated = { ...localFilters, [field]: value };
    setLocalFilters(updated);
    onChange(updated);
  };

  const handleUseMyLocation = () => {
    if (userLocation) {
      handleChange('latitude', userLocation.latitude);
      handleChange('longitude', userLocation.longitude);
    }
  };

  const handleClearLocation = () => {
    handleChange('latitude', '');
    handleChange('longitude', '');
    handleChange('radius', 10);
  };

  return (
    <div className="event-filters">
      <div className="filters-grid">
        {/* Category Filter */}
        <div className="filter-group">
          <label className="filter-label">Category</label>
          <select
            className="filter-select"
            value={localFilters.category}
            onChange={(e) => handleChange('category', e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range */}
        <div className="filter-group">
          <label className="filter-label">Start Date From</label>
          <input
            type="date"
            className="filter-input"
            value={localFilters.start_date_from}
            onChange={(e) => handleChange('start_date_from', e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Start Date To</label>
          <input
            type="date"
            className="filter-input"
            value={localFilters.start_date_to}
            onChange={(e) => handleChange('start_date_to', e.target.value)}
          />
        </div>

        {/* Price Range */}
        <div className="filter-group">
          <label className="filter-label">Min Price ($)</label>
          <input
            type="number"
            className="filter-input"
            placeholder="0"
            min="0"
            step="0.01"
            value={localFilters.min_price}
            onChange={(e) => handleChange('min_price', e.target.value ? parseFloat(e.target.value) : '')}
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Max Price ($)</label>
          <input
            type="number"
            className="filter-input"
            placeholder="1000"
            min="0"
            step="0.01"
            value={localFilters.max_price}
            onChange={(e) => handleChange('max_price', e.target.value ? parseFloat(e.target.value) : '')}
          />
        </div>

        {/* Location Filter */}
        <div className="filter-group filter-group-full">
          <label className="filter-label">Location</label>
          <div className="location-controls">
            {userLocation && !localFilters.latitude ? (
              <button
                type="button"
                className="location-btn"
                onClick={handleUseMyLocation}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 4V8L11 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" />
                </svg>
                Use My Location
              </button>
            ) : null}

            {localFilters.latitude && localFilters.longitude ? (
              <>
                <div className="location-inputs">
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Latitude"
                    step="any"
                    value={localFilters.latitude}
                    onChange={(e) => handleChange('latitude', e.target.value ? parseFloat(e.target.value) : '')}
                  />
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Longitude"
                    step="any"
                    value={localFilters.longitude}
                    onChange={(e) => handleChange('longitude', e.target.value ? parseFloat(e.target.value) : '')}
                  />
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Radius (km)"
                    min="1"
                    max="100"
                    value={localFilters.radius}
                    onChange={(e) => handleChange('radius', e.target.value ? parseFloat(e.target.value) : 10)}
                  />
                </div>
                <button
                  type="button"
                  className="clear-location-btn"
                  onClick={handleClearLocation}
                >
                  Clear
                </button>
              </>
            ) : null}

            {locationError && (
              <div className="location-error">
                Unable to get your location. Please enter coordinates manually.
              </div>
            )}
          </div>
        </div>

        {/* Upcoming/Past Toggle */}
        <div className="filter-group filter-group-full">
          <label className="filter-label">Event Type</label>
          <div className="toggle-group">
            <button
              type="button"
              className={`toggle-btn ${localFilters.upcoming ? 'active' : ''}`}
              onClick={() => handleChange('upcoming', true)}
            >
              Upcoming
            </button>
            <button
              type="button"
              className={`toggle-btn ${!localFilters.upcoming ? 'active' : ''}`}
              onClick={() => handleChange('upcoming', false)}
            >
              Past Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFilters;

