"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

type IconDefaultPrototype = { _getIconUrl?: () => void };
delete (L.Icon.Default.prototype as unknown as IconDefaultPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/marker-icon-2x.png",
  iconUrl: "/marker-icon.png",
  shadowUrl: "/marker-shadow.png",
});

interface MapSectionProps {
  tripId: string;
  initialLat?: number;
  initialLng?: number;
}

interface SavedLocation {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

interface LocationData {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
}

export default function MapSection({ tripId, initialLat, initialLng }: MapSectionProps) {
  // Use refs to maintain state across re-renders
  const mapRef = useRef<L.Map | null>(null);
  const currentCenterRef = useRef<[number, number]>(
    initialLat !== undefined && initialLng !== undefined
      ? [initialLat, initialLng]
      : [51.505, -0.09]
  );

  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [pendingLocation, setPendingLocation] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shouldFlyTo, setShouldFlyTo] = useState<[number, number] | null>(null);
  const [initialMapCenter, setInitialMapCenter] = useState<[number, number]>(currentCenterRef.current);

  // Load saved locations on component mount and set initial map position
  useEffect(() => {
    const loadLocations = async () => {
      try {
        const response = await fetch(`/api/trips/${tripId}/locations`);
        if (response.ok) {
          const locations: LocationData[] = await response.json();
          const formattedLocations = locations.map((loc) => ({
            id: loc.id,
            lat: loc.latitude,
            lng: loc.longitude,
            name: loc.name
          }));
          setSavedLocations(formattedLocations);

          // Set initial map center based on saved locations
          if (formattedLocations.length > 0) {
            // Fly to the last added location (most recent)
            const lastLocation = formattedLocations[formattedLocations.length - 1];
            const lastLocationPos: [number, number] = [lastLocation.lat, lastLocation.lng];
            setInitialMapCenter(lastLocationPos);
            currentCenterRef.current = lastLocationPos;
            // Trigger fly to the last location after map loads
            setShouldFlyTo(lastLocationPos);
          } else {
            // No saved locations, use default or initial position
            setInitialMapCenter(currentCenterRef.current);
          }
        }
      } catch (err) {
        console.error("Failed to load locations:", err);
        setError("Failed to load saved locations");
        // On error, use default position
        setInitialMapCenter(currentCenterRef.current);
      }
    };

    loadLocations();
  }, [tripId, initialLat, initialLng]);

  // Reverse geocode to get location name
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (err) {
      console.error("Geocoding error:", err);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, []);

  // Save location with useCallback to prevent re-renders
  const handleSave = useCallback(async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (!pendingLocation) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/trips/${tripId}/locations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latitude: pendingLocation.lat,
          longitude: pendingLocation.lng,
          name: pendingLocation.name,
        }),
      });

      if (response.ok) {
        const newLocation: LocationData = await response.json();
        const formattedLocation: SavedLocation = {
          id: newLocation.id,
          lat: newLocation.latitude,
          lng: newLocation.longitude,
          name: newLocation.name,
        };

        // Use functional update to prevent stale closure
        setSavedLocations(prev => [...prev, formattedLocation]);
        setPendingLocation(null);
        setError(null);

        // Prevent any navigation or page refresh
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        return false;
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to save location");
      }
    } catch (err) {
      console.error("Save location error:", err);
      setError("Failed to save location");
    } finally {
      setLoading(false);
    }
  }, [pendingLocation, tripId]);

  // Remove location with useCallback
  const handleRemoveLocation = useCallback(async (locationId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    try {
      const response = await fetch(`/api/trips/${tripId}/locations/${locationId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Use functional update
        setSavedLocations(prev => prev.filter(loc => loc.id !== locationId));
        setError(null);

        // Prevent any navigation or page refresh
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        return false;
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to remove location");
      }
    } catch (err) {
      console.error("Remove location error:", err);
      setError("Failed to remove location");
    }
  }, [tripId]);

  // Remove all locations
  const handleRemoveAllLocations = useCallback(async () => {
    if (savedLocations.length === 0) return;
    
    // Confirm action
    const confirmed = window.confirm(`Are you sure you want to remove all ${savedLocations.length} location${savedLocations.length !== 1 ? 's' : ''}? This action cannot be undone.`);
    if (!confirmed) return;

    setLoading(true);
    try {
      // Remove all locations one by one
      const deletePromises = savedLocations.map(location => 
        fetch(`/api/trips/${tripId}/locations/${location.id}`, {
          method: "DELETE",
        })
      );

      const responses = await Promise.all(deletePromises);
      
      // Check if all deletions were successful
      const allSuccessful = responses.every(response => response.ok);
      
      if (allSuccessful) {
        setSavedLocations([]);
        setError(null);
        // Clear any pending location as well
        setPendingLocation(null);
      } else {
        setError("Failed to remove some locations");
      }
    } catch (err) {
      console.error("Remove all locations error:", err);
      setError("Failed to remove all locations");
    } finally {
      setLoading(false);
    }
  }, [savedLocations, tripId]);

  // Handle search with useCallback
  const handleSearch = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}`
      );
      const data = await resp.json();
      if (!data.length) throw new Error("Location not found");
      const { lat, lon, display_name } = data[0];
      const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
      currentCenterRef.current = newPos;
      setPendingLocation({ lat: parseFloat(lat), lng: parseFloat(lon), name: display_name });
      setShouldFlyTo(newPos);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error searching location");
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Map event handlers
  function LocationMarker() {
    const map = useMap();
    
    // Store map reference
    useEffect(() => {
      mapRef.current = map;
    }, [map]);

    // Handle flyTo when shouldFlyTo changes
    useEffect(() => {
      if (shouldFlyTo && map) {
        // Add a small delay to ensure map is fully loaded
        setTimeout(() => {
          map.flyTo(shouldFlyTo, 13);
          setShouldFlyTo(null); // Reset after flying
        }, 100);
      }
    }, [shouldFlyTo, map]);

    useMapEvents({
      async click(e) {
        const { lat, lng } = e.latlng;
        setLoading(true);
        setError(null);
        
        try {
          const locationName = await reverseGeocode(lat, lng);
          setPendingLocation({ lat, lng, name: locationName });
        } catch (err) {
          console.error("Click handler error:", err);
          setError("Failed to get location name");
          setPendingLocation({ lat, lng, name: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        } finally {
          setLoading(false);
        }
      },
      moveend(e) {
        const center = e.target.getCenter();
        currentCenterRef.current = [center.lat, center.lng];
      },
    });

    return (
      <>
        {/* Pending location marker with popup */}
        {pendingLocation && (
          <Marker
            position={[pendingLocation.lat, pendingLocation.lng]}
            draggable
            eventHandlers={{
              async dragend(e) {
                const marker = e.target;
                const latlng = marker.getLatLng();
                setLoading(true);
                
                try {
                  const locationName = await reverseGeocode(latlng.lat, latlng.lng);
                  setPendingLocation({ lat: latlng.lat, lng: latlng.lng, name: locationName });
                } catch (err) {
                  console.error("Drag handler error:", err);
                  setPendingLocation({ 
                    lat: latlng.lat, 
                    lng: latlng.lng, 
                    name: `${latlng.lat.toFixed(4)}, ${latlng.lng.toFixed(4)}` 
                  });
                } finally {
                  setLoading(false);
                }
              },
            }}
          >
            <Popup closeOnClick={false} autoClose={false}>
              <div className="text-sm" onClick={(e) => e.stopPropagation()}>
                <strong>{pendingLocation.name}</strong>
                <br />
                <span className="text-gray-600">
                  {pendingLocation.lat.toFixed(4)}, {pendingLocation.lng.toFixed(4)}
                </span>
                <br />
                <div className="flex space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSave();
                    }}
                    disabled={loading}
                    className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded disabled:bg-gray-400"
                  >
                    {loading ? "Saving..." : "Save Location"}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setPendingLocation(null);
                    }}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Saved location markers with popups */}
        {savedLocations.map((location) => (
          <Marker key={location.id} position={[location.lat, location.lng]}>
            <Popup closeOnClick={false} autoClose={false}>
              <div className="text-sm" onClick={(e) => e.stopPropagation()}>
                <strong>{location.name}</strong>
                <br />
                <span className="text-gray-600">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
                <br />
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveLocation(location.id);
                  }}
                  className="mt-2 px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                >
                  Remove Location
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Location
      </h2>

      {/* Search box */}
      <form onSubmit={handleSearch} className="flex mb-2 space-x-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a place..."
          className="flex-grow border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded disabled:bg-gray-400"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Map */}
      <MapContainer 
        center={initialMapCenter} 
        zoom={2} 
        className="h-64 w-full rounded-lg"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <LocationMarker />
      </MapContainer>

      {/* Controls under the map */}
      <div className="mt-2 flex justify-between items-center">
        {/* Saved locations counter */}
        <div>
          {savedLocations.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {savedLocations.length} location{savedLocations.length !== 1 ? 's' : ''} saved
            </p>
          )}
        </div>

        {/* Remove all locations button */}
        <button
          type="button"
          onClick={handleRemoveAllLocations}
          disabled={savedLocations.length === 0 || loading}
          className={`px-3 py-2 text-sm rounded transition-colors ${
            savedLocations.length === 0 || loading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {loading ? "Removing..." : "Remove All Locations"}
        </button>
      </div>
    </div>
  );
}
