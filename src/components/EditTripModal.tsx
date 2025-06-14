"use client";

import { useState } from "react";

interface TripForEdit {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  notes?: string | null;
}

interface EditTripModalProps {
  trip: TripForEdit;
  onSave: (updated: { title: string; startDate: Date; endDate: Date; notes?: string }) => void;
}

export default function EditTripModal({ trip, onSave }: EditTripModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(trip.title);
  const [startDate, setStartDate] = useState(trip.startDate.toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(trip.endDate.toISOString().split('T')[0]);
  const [notes, setNotes] = useState(trip.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  // Handle trip update
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);

    const res = await fetch(`/api/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, startDate: startDateObj.toISOString(), endDate: endDateObj.toISOString(), notes }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Update failed");
    } else {
      const updated = await res.json();
      onSave({ title: updated.title, startDate: new Date(updated.startDate), endDate: new Date(updated.endDate), notes: updated.notes });
      setOpen(false);
    }
  }

  // Handle trip deletion
  async function handleDelete() {
    if (!confirm("Delete this trip?")) return;
  
    const res = await fetch(`/api/trips/${trip.id}`, {
      method: "DELETE",
    });
  
    if (res.ok) {
      // Force a full page reload to /trips, avoiding any cache/stale‐data
      window.location.href = "/trips";
    } else {
      // Try parse an error message, fallback gracefully
      let msg = "Delete failed";
      try {
        const body = await res.json();
        if (body.error) msg = body.error;
      } catch {}
      alert(msg);
    }
  }

  return (
    <>
      {/* Edit & Delete buttons container */}
      <div className="absolute top-4 right-4 flex space-x-2">
        {/* Pencil icon button */}
        <button
          onClick={() => setOpen(true)}
          className="text-gray-600 dark:text-gray-300 p-1 hover:text-gray-800 dark:hover:text-gray-100"
          title="Edit trip"
        >
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
              d="M17.414 2.586a2 2 0 012.828 2.828L7 18.657l-4 1 1-4L17.414 2.586z"
            />
          </svg>
        </button>
        {/* Trash icon button */}
        <button
          onClick={handleDelete}
          className="text-red-400 hover:text-red-300 p-1 rounded transition-colors disabled:opacity-50"
          title="Delete trip"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" 
            />
          </svg>
        </button>
      </div>

      {/* Edit Modal */}
      {open && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative z-[2001] bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Edit Trip</h2>
            {error && <p className="mb-2 text-red-600">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Start date</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">End date</label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border rounded p-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  rows={4}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}