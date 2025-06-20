import NavBar from "@/components/NavBar";
import AddTripModal from "@/components/AddTripModal";
import TripCard from "@/components/TripCard";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function TripsPage() {
  // Protect route
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Load the user's trips
  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
    include: { coverPhoto: true },
  });

  // Get total locations count
  const totalLocations = await prisma.location.count({
    where: {
      trip: {
        userId: session.user.id
      }
    }
  });

  // Get total photos count
  const totalPhotos = await prisma.photo.count({
    where: {
      trip: {
        userId: session.user.id
      }
    }
  });

  return (
    <>
      {/* Shared header + drawer */}
      <NavBar />

      {/* Page content */}
      <main className="pt-20 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header Section */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  Your Trips
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  {trips.length === 0 
                    ? "Start documenting your travel adventures"
                    : `${trips.length} trip${trips.length !== 1 ? 's' : ''} documented`
                  }
                </p>
              </div>
              
              {/* Add Trip Button */}
              <div className="flex-shrink-0">
                <AddTripModal />
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {trips.length === 0 ? (
            /* Empty State */
            <div className="text-center py-16">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-6">
                <svg 
                  className="w-12 h-12 text-blue-600 dark:text-blue-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
                  />
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={1.5} 
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
                  />
                </svg>
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                No trips yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                Start your travel documentation journey by creating your first trip. 
                Add photos, locations, and memories to build your personal travel vault.
              </p>
            </div>
          ) : (
            <>
              {/* Trips Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {trips.map((trip) => (
                  <Link
                    key={trip.id}
                    href={`/trips/${trip.id}`}
                    className="group block transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <TripCard trip={trip} />
                  </Link>
                ))}
              </div>

              {/* Statistics Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {trips.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Total Trips
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {totalLocations}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Locations Pinned
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {totalPhotos}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Photos Uploaded
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      Keep Building Your Travel Story
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Add more trips, photos, and memories to your collection
                    </p>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Link
                      href="/ai"
                      className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Plan New Trip
                    </Link>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
