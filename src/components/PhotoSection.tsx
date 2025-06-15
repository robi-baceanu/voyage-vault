"use client";

import { useState, useEffect } from "react";
import PhotoUploader from "@/components/PhotoUploader";
import PhotoLightbox from "@/components/PhotoLightbox";

interface Photo {
  id: string;
  url: string;
  createdAt: string;
  notes?: string | null;
}

interface PhotoSectionProps {
  tripId: string;
  coverPhotoId?: string | null;
}

export default function PhotoSection({ tripId }: PhotoSectionProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch photos for this trip
  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/photos?tripId=${encodeURIComponent(tripId)}`);
      if (!res.ok) throw new Error("Failed to fetch photos");
      const data: Photo[] = await res.json();
      setPhotos(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [tripId]);

  // Handle successful photo upload
  const handleUploadSuccess = (newPhoto: Photo) => {
    // Add the new photo to the existing photos array
    setPhotos(prevPhotos => [newPhoto, ...prevPhotos]);
  };

  // Set photo as cover
  const handleSetCover = async (photoId: string) => {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverPhotoId: photoId }),
    });
    if (res.ok) {
      fetchPhotos();
    } else {
      alert("Failed to set cover");
    }
  };

  // Open lightbox at specific index
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  return (
    <div>
      {/* Loading & Error States */}
      {loading && <p className="text-gray-700 dark:text-gray-300">Loading photos…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Photo Grid */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.url}
              alt="Trip photo"
              onClick={() => openLightbox(index)}
              className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:opacity-90 transition-opacity"
            />
            {/* Set as cover button, appears on hover */}
            <button
              onClick={() => handleSetCover(photo.id)}
              className="absolute top-2 left-2 bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Set as cover
            </button>
            {/* Delete photo button */}
            <button
              onClick={async () => {
                if (confirm("Delete this photo?")) {
                  const res = await fetch(`/api/photos/${photo.id}`, { method: "DELETE" });
                  if (res.ok) fetchPhotos();
                  else alert("Failed to delete photo");
                }
              }}
              className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {/* Trash icon */}  
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* Lightbox Overlay */}
      {lightboxOpen && (
        <PhotoLightbox
          photos={photos}
          initialIndex={currentIndex}
          onClose={closeLightbox}
        />
      )}

      {/* Pass the upload success handler to parent */}
      <div className="hidden">
        <PhotoUploader tripId={tripId} onUploadSuccess={handleUploadSuccess} />
      </div>
    </div>
  );
}