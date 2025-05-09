"use client";

import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import EditTripModal from "@/components/EditTripModal";
import PhotoSection from "@/components/PhotoSection";
import dynamic from "next/dynamic";

interface Trip {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  coverPhotoId?: string | null;
  coverPhotoUrl?: string | null;
}

interface Props {
  trip: Trip;
}

export default function TripDetailClient({ trip }: Props) {
  const router = useRouter();

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

  return (
    <>
      <NavBar />

      <main className="pt-20 min-h-screen bg-white dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {trip.title}
          </h1>
          {/* Cover photo banner or placeholder */}
          <div className="mb-4 w-full h-64 overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            {trip.coverPhotoUrl ? (
              <img
                src={trip.coverPhotoUrl}
                alt="Cover"
                className="object-cover w-full h-full"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-400 dark:text-gray-500"
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
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {new Date(trip.startDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}{" "}
            -{" "}
            {new Date(trip.endDate).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>

          {trip.notes ? (
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
              {trip.notes}
            </p>
          ) : (
            <p className="text-gray-500 dark:text-gray-500">
              No notes for this trip.
            </p>
          )}

          {/* Edit button + modal */}
          <EditTripModal
            trip={tripForEdit}
            onSave={() => {
              // Refresh data server-side
              router.refresh();
            }}
          />

          {/* Photo gallery + uploader */}
          <PhotoSection tripId={trip.id} />

          {/* Map picker */}
          <MapSection
            tripId={trip.id}
            initialLat={trip.latitude ?? undefined}
            initialLng={trip.longitude ?? undefined}
          />
        </div>
      </main>
    </>
  );
}
