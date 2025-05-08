import { Trip } from "@prisma/client";
import React from "react";

interface TripCardProps {
  trip: Trip;
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
      <div className="p-4 flex-grow">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {trip.title}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
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
        {trip.notes && (
          <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
            {trip.notes}
          </p>
        )}
      </div>
      {/* Future: image thumbnail or map preview could go here */}
    </div>
  );
}
