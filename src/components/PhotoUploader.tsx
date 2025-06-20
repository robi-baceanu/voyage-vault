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
      console.log("Starting upload for file:", file.name);

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('tripId', tripId);

      // Send to new upload API
      const res = await fetch("/api/photos/upload", {
        method: "POST",
        body: formData,
      });

      console.log("Response status:", res.status);
      console.log("Response headers:", res.headers.get('content-type'));

      // Get response text first to debug
      const responseText = await res.text();
      console.log("Response text:", responseText);

      if (!res.ok) {
        // Try to parse as JSON, fallback to text
        let errorMessage = "Upload failed";
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.error || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Parse successful response
      const photo: Photo = JSON.parse(responseText);
      onUploadSuccess(photo);
    } catch (err: unknown) {
      console.error("Upload error:", err);
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
      
      {error && (
        <div className="mt-2 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}