"use client";

import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
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

// Recenter map when position changes
function RecenterMap({ position }: { position: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(position, map.getZoom());
  }, [position, map]);
  return null;
}

export default function MapSection({ tripId, initialLat, initialLng }: MapSectionProps) {
  const [position, setPosition] = useState<[number, number]>(
    initialLat !== undefined && initialLng !== undefined
      ? [initialLat, initialLng]
      : [51.505, -0.09]
  );
  const [hasLocation, setHasLocation] = useState(
    initialLat !== undefined && initialLng !== undefined
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle map clicks & marker drag
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setHasLocation(true);
      },
    });
    return hasLocation ? (
      <Marker
        position={position}
        draggable
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const latlng = marker.getLatLng();
            setPosition([latlng.lat, latlng.lng]);
          },
        }}
      />
    ) : null;
  }

  // Search using Nominatim
  const handleSearch = async () => {
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
      const { lat, lon } = data[0];
      const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
      setPosition(newPos);
      setHasLocation(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error searching location");
    } finally {
      setLoading(false);
    }
  };

  // Save location to backend
  const handleSave = async () => {
    await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latitude: position[0], longitude: position[1] }),
    });
    window.location.reload();
  };

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
        Location
      </h2>

      {/* Search box */}
      <div className="flex mb-2 space-x-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a place..."
          className="flex-grow border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      {/* Map */}
      <MapContainer center={position} zoom={13} className="h-64 w-full rounded-lg">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <RecenterMap position={position} />
        <LocationMarker />
      </MapContainer>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={!hasLocation}
        className="mt-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
      >
        Save Location
      </button>
    </div>
  );
}
