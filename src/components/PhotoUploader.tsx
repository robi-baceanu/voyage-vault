"use client";

import { useRef, useState } from "react";

interface Photo {
  id: string;
  url: string;
  createdAt: string;
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
      // Read file as Data URL
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUrl = reader.result;
        if (typeof dataUrl !== "string") throw new Error("Failed to read file");

        // Send to API
        const res = await fetch("/api/photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tripId, url: dataUrl }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const photo: Photo = await res.json();
        onUploadSuccess(photo);
      };

      reader.onerror = () => {
        throw new Error("File reading error");
      };
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
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        className="hidden"
      />

      {/* Styled button to trigger file input */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded mb-2"
      >
        Add photos
      </button>
      
      {uploading && (
        <p className="mt-2 text-gray-700 dark:text-gray-300">Uploading…</p>
      )}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}