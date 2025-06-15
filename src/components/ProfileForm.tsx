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
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">Loading profile...</span>
      </div>
    );
  }
  
  if (error && !profile) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-red-600 text-lg font-medium">Failed to load profile</p>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Profile Picture Section */}
      <div className="text-center">
        <div className="relative inline-block">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleAvatarChange}
          />
          
          {/* Avatar Container */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 mx-auto">
              {image ? (
                <img
                  src={image}
                  alt="Profile Avatar"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-gray-400 dark:text-gray-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Upload Overlay */}
            <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center"
                 onClick={() => fileInputRef.current?.click()}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>

          {/* Upload Status */}
          {avatarUploading && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full flex items-center">
                <div className="animate-spin rounded-full h-3 w-3 border border-white border-t-transparent mr-2"></div>
                Uploading...
              </div>
            </div>
          )}
        </div>

        {/* Avatar Actions */}
        <div className="mt-6 flex justify-center space-x-3">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {image ? 'Change Photo' : 'Upload Photo'}
          </button>
          
          {image && (
            <button
              onClick={handleAvatarDelete}
              disabled={avatarUploading}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
              </svg>
              Remove
            </button>
          )}
        </div>

        {avatarError && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-sm">{avatarError}</p>
          </div>
        )}
      </div>

      {/* Profile Information Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Status Messages */}
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
            <svg className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-green-600 dark:text-green-400">Profile updated successfully!</p>
          </div>
        )}

        {/* Email Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
            <input
              type="email"
              value={profile!.email}
              disabled
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Email cannot be changed. Contact support if you need to update your email.
          </p>
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Display Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="block w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your display name"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                Saving Changes...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
