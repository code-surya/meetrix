import { useEffect, useRef, useState } from 'react';
import { Event } from '@/features/events/eventsTypes';
import './EventMap.css';

interface EventMapProps {
  events: Event[];
  center?: { lat: number; lng: number };
  filters?: any;
  zoom?: number;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

const EventMap = ({ events, center, filters, zoom = 12 }: EventMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Load Google Maps script
  useEffect(() => {
    if (window.google) {
      setIsMapLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setIsMapLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || map) return;

    const mapCenter = center || { lat: 40.7128, lng: -74.0060 }; // Default to NYC

    const newMap = new window.google.maps.Map(mapRef.current, {
      center: mapCenter,
      zoom: zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    });

    setMap(newMap);
  }, [isMapLoaded, center, zoom, map]);

  // Update map center when filters change
  useEffect(() => {
    if (!map || !filters?.latitude || !filters?.longitude) return;

    const newCenter = {
      lat: filters.latitude,
      lng: filters.longitude,
    };

    map.setCenter(newCenter);
    if (filters.radius) {
      const circle = new window.google.maps.Circle({
        strokeColor: '#007bff',
        strokeOpacity: 0.3,
        strokeWeight: 2,
        fillColor: '#007bff',
        fillOpacity: 0.1,
        map: map,
        center: newCenter,
        radius: filters.radius * 1000, // Convert km to meters
      });
    }
  }, [map, filters]);

  // Create markers for events
  useEffect(() => {
    if (!map || !window.google || events.length === 0) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    const newMarkers: any[] = [];

    events.forEach((event) => {
      if (!event.location?.latitude || !event.location?.longitude) return;

      const marker = new window.google.maps.Marker({
        position: {
          lat: event.location.latitude,
          lng: event.location.longitude,
        },
        map: map,
        title: event.title,
        icon: {
          url: '/marker-icon.png',
          scaledSize: new window.google.maps.Size(32, 32),
        },
      });

      // Info window
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div class="map-info-window">
            <h3>${event.title}</h3>
            <p>${event.venue.city}, ${event.venue.country}</p>
            <p>${new Date(event.start_date).toLocaleDateString()}</p>
            <a href="/events/${event.id}" target="_blank">View Details</a>
          </div>
        `,
      });

      marker.addListener('click', () => {
        // Close other info windows
        markers.forEach((m) => {
          if (m.infoWindow) m.infoWindow.close();
        });
        infoWindow.open(map, marker);
        setSelectedEvent(event);
      });

      marker.infoWindow = infoWindow;
      newMarkers.push(marker);
    });

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        bounds.extend(marker.getPosition());
      });
      map.fitBounds(bounds);
    }
  }, [map, events]);

  if (!isMapLoaded) {
    return (
      <div className="event-map-loading">
        <div className="loading-spinner"></div>
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <div className="event-map-container">
      <div ref={mapRef} className="event-map" />
      {selectedEvent && (
        <div className="map-event-card">
          <h3>{selectedEvent.title}</h3>
          <p>{selectedEvent.venue.city}, {selectedEvent.venue.country}</p>
          <a href={`/events/${selectedEvent.id}`}>View Details →</a>
        </div>
      )}
    </div>
  );
};

export default EventMap;

