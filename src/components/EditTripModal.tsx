"use client";

import { useState } from "react";

interface TripForEdit {
  id: string;
  title: string;
  date: Date;
  notes?: string | null;
}

interface EditTripModalProps {
  trip: TripForEdit;
  onSave: (updated: { title: string; date: Date; notes?: string }) => void;
}

export default function EditTripModal({ trip, onSave }: EditTripModalProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(trip.title);

  const [date, setDate] = useState(trip.date.toISOString().split('T')[0]);
  const [notes, setNotes] = useState(trip.notes ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const dateObj = new Date(date);

    const res = await fetch(`/api/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, date: dateObj.toISOString(), notes }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Update failed");
    } else {
      const updated = await res.json();
      onSave({ title: updated.title, date: new Date(updated.date), notes: updated.notes });
      setOpen(false);
    }
  }

  return (
    <>
      {/* Pencil icon button */}
      <button
        onClick={() => setOpen(true)}
        className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 p-1 hover:text-gray-800 dark:hover:text-gray-100"
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

      {/* Modal */}
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
                <label className="block text-gray-700 dark:text-gray-300 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
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
