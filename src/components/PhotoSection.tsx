"use client";

import { useState, useEffect } from "react";
import PhotoUploader from "@/components/PhotoUploader";
import PhotoLightbox from "@/components/PhotoLightbox";

interface Photo {
  id: string;
  url: string;
  createdAt: string;
}

interface PhotoSectionProps {
  tripId: string;
  coverPhotoId?: string | null;
}

export default function PhotoSection({ tripId, coverPhotoId }: PhotoSectionProps) {
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

  // Callback after a successful upload
  const handleUploadSuccess = (newPhoto: Photo) => {
    setPhotos((prev) => [newPhoto, ...prev]);
  };

  const handleSetCover = async (photoId: string) => {
    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverPhotoId: photoId }),
    });
    if (res.ok) {
      fetchPhotos();
    } else {
      alert("Failed to set cover photo");
    }
  };

  // Clear the trip’s cover photo
  const handleRemoveCover = async () => {
    if (!confirm("Remove cover photo?")) return;
    const res = await fetch(`/api/trips/${tripId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverPhotoId: null }),
    });
    if (res.ok) {
      // refresh both the cover banner and photo list
      // router.refresh();
      fetchPhotos();
    } else {
      alert("Failed to remove cover");
    }
  };

  // Open lightbox at specific index
  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Photos
      </h2>

      {/* Uploader */}
      <div className="mb-4 flex justify-between items-center">
        <PhotoUploader tripId={tripId} onUploadSuccess={handleUploadSuccess} />
        {coverPhotoId && (
          <button
            onClick={handleRemoveCover}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded mb-2"
          >
            Remove cover
          </button>
        )}
      </div>

      {/* Loading & Error States */}
      {loading && <p className="text-gray-700 dark:text-gray-300">Loading photos…</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Photo Grid */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.url}
              alt="Trip photo"
              onClick={() => openLightbox(index)}
              className="w-full h-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer"
            />
            {/* Set as cover button, appears on hover */}
            <button
              onClick={() => handleSetCover(photo.id)}
              className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 bg-green-600 hover:bg-green-700 text-white rounded-full p-1 transition"
            >
              {/* Photograph icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V4z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 15l6-6m0 0l4 4 6-6"
                />
              </svg>
            </button>
            {/* Trash button, appears on hover */}
            <button
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 transition"
              onClick={async () => {
                if (!confirm("Delete this photo?")) return;
                const res = await fetch("/api/photos", {
                  method: "DELETE",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ id: photo.id }),
                });
                if (res.ok) {
                  // remove from state
                  setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
                } else {
                  alert("Failed to delete");
                }
              }}
            >
              {/* Trash icon */}  
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
    </div>
  );
}