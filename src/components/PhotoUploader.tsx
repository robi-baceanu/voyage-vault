"use client";

import { useRef, useState } from "react";

interface Photo {
  id: string;
  url: string;
  createdAt: string;
  notes?: string | null;
}

interface PhotoUploaderProps {
  tripId: string;
  onUploadSuccess: (photo: Photo) => void;
}

export default function PhotoUploader({ tripId, onUploadSuccess }: PhotoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setUploading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tripId', tripId);

      // Send to new upload API
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }

      const photo: Photo = await res.json();
      onUploadSuccess(photo);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded"
      >
        {uploading ? "Uploading..." : "Add photos"}
      </button>
      
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}