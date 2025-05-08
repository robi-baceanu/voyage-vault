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
