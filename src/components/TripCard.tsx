import { Trip, Photo } from "@prisma/client";
import React from "react";

interface TripCardProps {
  trip: Trip & { coverPhoto?: Photo | null };
}

export default function TripCard({ trip }: TripCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden flex flex-col">
      <div className="h-48 w-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        {trip.coverPhoto?.url ? (
          <img
            src={trip.coverPhoto.url}
            alt="Cover"
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            {/* placeholder SVG */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 text-gray-400 dark:text-gray-500"
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
          </div>
        )}
      </div>
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
      </div>
      {/* Future: image thumbnail or map preview could go here */}
    </div>
  );
}
