// src/components/ProfileForm.tsx
"use client";

import { useState, useEffect, useRef } from "react";

interface Profile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Load profile on mount
  useEffect(() => {
    fetch("/api/profile")
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load profile");
        const data: Profile = await res.json();
        setProfile(data);
        setName(data.name ?? "");
        setImage(data.image ?? "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Handle avatar file selection
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError(null);
    setAvatarUploading(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const dataUrl = reader.result as string;
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }
        const updated: Profile = await res.json();
        setProfile(updated);
        setImage(updated.image ?? "");
      };
      reader.onerror = () => {
        throw new Error("File reading error");
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setAvatarError(msg);
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Remove avatar handler
  const handleAvatarDelete = async () => {
    if (!confirm("Remove avatar?")) return;
    setAvatarError(null);
    setAvatarUploading(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Remove failed");
      }
      const updated: Profile = await res.json();
      setProfile(updated);
      setImage(updated.image ?? "");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setAvatarError(msg);
    } finally {
      setAvatarUploading(false);
    }
  };

  // Handle name submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Update failed");
      }
      const updated: Profile = await res.json();
      setProfile(updated);
      setName(updated.name ?? "");
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-gray-900 dark:text-gray-100">Loading…</p>;
  if (error && !profile) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      {/* Avatar Upload */}
      <div className="mb-4 flex flex-col items-center">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleAvatarChange}
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-48 h-48 rounded-full overflow-hidden border-2 border-gray-300 dark:border-gray-600 
                     bg-gray-100 dark:bg-gray-700 cursor-pointer flex items-center justify-center"
        >
          {image ? (
            <img
              src={image}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 dark:text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          )}
        </div>

        {/* Choose / Remove button */}
        {image ? (
          <button
            onClick={handleAvatarDelete}
            className="mt-4 px-4 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
          >
            Remove avatar
          </button>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 px-4 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
          >
            Choose avatar
          </button>
        )}

        {avatarUploading && (
          <p className="mt-2 text-gray-700 dark:text-gray-300">Uploading…</p>
        )}
        {avatarError && <p className="mt-2 text-red-600">{avatarError}</p>}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-600">{error}</p>}
        {success && <p className="text-green-600">Profile updated!</p>}

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Email</label>
          <input
            type="email"
            value={profile!.email}
            disabled
            className="w-full border rounded p-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block mb-1 text-gray-700 dark:text-gray-300">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            placeholder="Your display name"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          {submitting ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
