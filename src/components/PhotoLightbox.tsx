"use client";

import { useState } from "react";

interface Photo {
  id: string;
  url: string;
  createdAt: string;
  notes?: string | null;
}

interface PhotoLightboxProps {
  photos: Photo[];
  initialIndex: number;
  onClose: () => void;
}

export default function PhotoLightbox({ photos, initialIndex, onClose }: PhotoLightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  if (!photos || photos.length === 0) return null;

  const currentPhoto = photos[current];
  
  const prev = () => {
    setCurrent((i) => (i - 1 + photos.length) % photos.length);
    setIsEditingNote(false);
  };
  
  const next = () => {
    setCurrent((i) => (i + 1) % photos.length);
    setIsEditingNote(false);
  };

  const handleEditNote = () => {
    setNoteText(currentPhoto.notes || "");
    setIsEditingNote(true);
  };

  const handleSaveNote = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/photos/${currentPhoto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: noteText.trim() || null }),
      });

      if (response.ok) {
        // Update the photo in the photos array
        photos[current] = { ...currentPhoto, notes: noteText.trim() || null };
        setIsEditingNote(false);
      } else {
        alert('Failed to save note');
      }
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveNote = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/photos/${currentPhoto.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes: null }),
      });

      if (response.ok) {
        // Update the photo in the photos array
        photos[current] = { ...currentPhoto, notes: null };
      } else {
        alert('Failed to remove note');
      }
    } catch (error) {
      console.error('Error removing note:', error);
      alert('Failed to remove note');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingNote(false);
    setNoteText("");
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black bg-opacity-90">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Previous arrow */}
      {photos.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      )}

      {/* Main content container */}
      <div className="flex flex-col items-center justify-center max-w-7xl max-h-full p-4">
        {/* Image */}
        <div className="relative mb-4">
          <img
            src={currentPhoto.url}
            alt="Full-screen photo"
            className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Notes section */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 max-w-2xl w-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-gray-500 font-medium">Photo Notes</h3>
            <div className="flex space-x-2">
              {!isEditingNote && (
                <>
                  <button
                    onClick={handleEditNote}
                    className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                    title={currentPhoto.notes ? "Edit note" : "Add note"}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  {currentPhoto.notes && (
                    <button
                      onClick={handleRemoveNote}
                      disabled={isSaving}
                      className="text-red-400 hover:text-red-300 p-1 rounded transition-colors disabled:opacity-50"
                      title="Remove note"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4m-4 0a1 1 0 00-1 1v1h6V4a1 1 0 00-1-1m-4 0h4" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {isEditingNote ? (
            <div className="space-y-3">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note for this photo..."
                className="w-full p-3 bg-white text-black placeholder-gray-500 rounded-md border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
                rows={3}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-gray-300 text-sm">{noteText.length}/500</span>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveNote}
                    disabled={isSaving}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-white">
              {currentPhoto.notes ? (
                <p className="text-black leading-relaxed">{currentPhoto.notes}</p>
              ) : (
                <p className="text-gray-400 italic">No notes added yet. Click the edit icon to add a note.</p>
              )}
            </div>
          )}
        </div>

        {/* Photo counter */}
        {photos.length > 1 && (
          <div className="mt-3 text-white text-sm opacity-75">
            {current + 1} of {photos.length}
          </div>
        )}
      </div>

      {/* Next arrow */}
      {photos.length > 1 && (
        <button
          onClick={next}
          className="absolute right-4 text-white p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors z-10"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
