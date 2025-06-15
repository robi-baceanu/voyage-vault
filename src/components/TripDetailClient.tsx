"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import EditTripModal from "@/components/EditTripModal";
import PhotoSection from "@/components/PhotoSection";
import PhotoUploader from "@/components/PhotoUploader";
import dynamic from "next/dynamic";
import { useState } from "react";

interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  notes?: string | null;
  coverPhotoId?: string | null;
  coverPhotoUrl?: string | null;
}

interface Props {
  trip: Trip;
}

export default function TripDetailClient({ trip }: Props) {
  const router = useRouter();
  const [refreshKey, setRefreshKey] = useState(0);

  const tripForEdit = {
    id: trip.id,
    title: trip.title,
    startDate: new Date(trip.startDate),
    endDate: new Date(trip.endDate),
    notes: trip.notes,
  };

  const MapSection = dynamic(
     () => import("@/components/MapSection"),
     { ssr: false }
  );

  // Remove photo as cover
  const handleRemoveCover = async () => {
    const res = await fetch(`/api/trips/${trip.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverPhotoId: null }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to remove cover");
    }
  };

  // Handle photo upload success
  const handlePhotoUploadSuccess = () => {
    // Trigger a re-render of the photo section
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <NavBar />

      <main className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Hero Section with Cover Photo */}
        <div className="relative w-full h-80 overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600">
          {trip.coverPhotoUrl ? (
            <>
              <img
                src={trip.coverPhotoUrl}
                alt="Cover"
                className="object-cover w-full h-full"
              />
              {/* Gradient overlay only at the bottom for text readability */}
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/100 to-transparent"/>
              {/* Remove cover button - appears on hover */}
              <div className="absolute inset-0 group">
                <button
                  onClick={handleRemoveCover}
                  className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                  title="Remove cover"
                >
                  Remove cover
                </button>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-20 w-20 text-white opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
          
          {/* Trip Title and Dates Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold mb-2 drop-shadow-lg">
                {trip.title}
              </h1>
              <p className="text-lg opacity-90 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {new Date(trip.startDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}{" "}
                -{" "}
                {new Date(trip.endDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Trip Notes Card */}
          {(trip.notes || !trip.notes) && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8 relative">
              {/* Edit button positioned in top right of notes card */}
              <div className="absolute top-4 right-4">
                <EditTripModal
                  trip={tripForEdit}
                  onSave={() => {
                    router.refresh();
                  }}
                />
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Trip Notes
              </h2>
              {trip.notes ? (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                  {trip.notes}
                </p>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 italic">
                  No notes added yet. Click the edit button to add some trip details!
                </p>
              )}
            </div>
          )}

          {/* Two Column Layout for Photos and Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Photo Gallery Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center min-h-[72px]">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Photos
                </h2>
                {/* Add Photos button in header */}
                <PhotoUploader 
                  tripId={trip.id} 
                  onUploadSuccess={handlePhotoUploadSuccess} 
                />
              </div>
              <div className="p-4">
                <PhotoSection 
                  key={refreshKey} 
                  tripId={trip.id} 
                  coverPhotoId={trip.coverPhotoId ?? null} 
                />
              </div>
            </div>

            {/* Map Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center min-h-[72px]">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Locations
                </h2>
                {/* Empty div to maintain layout balance */}
                <div></div>
              </div>
              <div className="p-4">
                <MapSection tripId={trip.id} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}