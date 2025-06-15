"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface TripLocation {
  id: string;
  title: string;
  latitude: number;
  longitude: number;
  startDate: string;
  endDate: string;
  coverPhoto?: string;
  locationName?: string;
}

export default function HomeMapSection() {
  const [locations, setLocations] = useState<TripLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTripLocations();
  }, []);

  const fetchTripLocations = async () => {
    try {
      setError(null);
      const response = await fetch("/api/trips/locations");
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setLocations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching trip locations:", err);
      setError(err instanceof Error ? err.message : "Failed to load trip locations");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-90 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500 dark:text-gray-400">Loading your travel map...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-90 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-2">Error: {error}</p>
          <button
            onClick={fetchTripLocations}
            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="h-90 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400 mb-3">No trip locations found</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Add locations to your trips to see them on the map!
          </p>
        </div>
      </div>
    );
  }

  // Calculate center point of all locations
  const centerLat = locations.reduce((sum, loc) => sum + loc.latitude, 0) / locations.length;
  const centerLng = locations.reduce((sum, loc) => sum + loc.longitude, 0) / locations.length;

  // Calculate appropriate zoom level based on the spread of locations
  const latitudes = locations.map(loc => loc.latitude);
  const longitudes = locations.map(loc => loc.longitude);
  const latSpread = Math.max(...latitudes) - Math.min(...latitudes);
  const lngSpread = Math.max(...longitudes) - Math.min(...longitudes);
  const maxSpread = Math.max(latSpread, lngSpread);
  
  let zoom = 10;
  if (maxSpread > 50) zoom = 2;
  else if (maxSpread > 20) zoom = 3;
  else if (maxSpread > 10) zoom = 4;
  else if (maxSpread > 5) zoom = 5;
  else if (maxSpread > 2) zoom = 6;
  else if (maxSpread > 1) zoom = 7;
  else if (maxSpread > 0.5) zoom = 8;
  else if (maxSpread > 0.1) zoom = 9;

  return (
    <div className="h-90 rounded-lg overflow-hidden">
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={zoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location, index) => (
          <Marker
            key={`${location.id}-${index}`}
            position={[location.latitude, location.longitude]}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                {location.coverPhoto && (
                  <img
                    src={location.coverPhoto}
                    alt={location.title}
                    className="w-full h-24 object-cover rounded mb-2"
                  />
                )}
                <h3 className="font-semibold text-sm mb-1">{location.title}</h3>
                {location.locationName && (
                  <p className="text-xs text-gray-600 mb-1">{location.locationName}</p>
                )}
                <p className="text-xs text-gray-600 mb-2">
                  {new Date(location.startDate).toLocaleDateString()} - {new Date(location.endDate).toLocaleDateString()}
                </p>
                <a
                  href={`/trips/${location.id}`}
                  className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                >
                  View Trip Details →
                </a>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}