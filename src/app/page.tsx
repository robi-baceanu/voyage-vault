"use client";

import { useSession } from "next-auth/react";
import NavBar from "../components/NavBar";
import { useState, useEffect } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const HomeMapSection = dynamic(() => import("../components/HomeMapSection"), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
      <p className="text-gray-500 dark:text-gray-400">Loading map...</p>
    </div>
  ),
});

interface TripStats {
  totalTrips: number;
  totalPhotos: number;
  totalLocations: number;
  recentTrips: Array<{
    id: string;
    title: string;
    startDate: string;
    endDate: string;
    coverPhoto?: string;
  }>;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const [userName, setUserName] = useState<string | null>(null);
  const [loadingName, setLoadingName] = useState(false);
  const [tripStats, setTripStats] = useState<TripStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Fetch user profile
  useEffect(() => {
    if (status === "authenticated") {
      setLoadingName(true);
      fetch("/api/profile")
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch profile");
          const data = await res.json();
          setUserName(data.name);
        })
        .catch(() => {
          setUserName(null);
        })
        .finally(() => {
          setLoadingName(false);
        });
    }
  }, [status]);

  // Fetch trip statistics
  useEffect(() => {
    if (status === "authenticated") {
      setLoadingStats(true);
      fetch("/api/trips/stats")
        .then(async (res) => {
          if (!res.ok) throw new Error("Failed to fetch stats");
          const data = await res.json();
          setTripStats(data);
        })
        .catch((err) => {
          console.error("Failed to fetch trip stats:", err);
        })
        .finally(() => {
          setLoadingStats(false);
        });
    }
  }, [status]);

  if (status === "loading") {
    return (
      <>
        <NavBar />
        <main className="pt-20 flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-900 dark:text-gray-100">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <AuthenticatedHomePage userName={userName} loadingName={loadingName} tripStats={tripStats} loadingStats={loadingStats} />;
}

function LandingPage() {
  return (
    <>
      <NavBar />
      <main className="pt-20 bg-white dark:bg-gray-900 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to <span className="text-yellow-300">Voyage Vault</span>
            </h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
              Your personal travel companion powered by AI. Document your journeys, 
              plan new adventures, and relive your memories with interactive maps and smart insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Start Your Journey
              </Link>
              <Link
                href="/auth/signin"
                className="px-8 py-3 border-2 border-white hover:bg-white hover:text-gray-900 font-semibold rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
              Everything You Need for Travel Documentation
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Interactive Maps</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Pin your favorite locations and view all your travels on beautiful interactive maps.
                </p>
              </div>

              <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03 8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">AI Travel Assistant</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Get personalized travel recommendations and plan your next adventure with AI-powered insights.
                </p>
              </div>

              <div className="text-center p-6 bg-white dark:bg-gray-900 rounded-lg shadow-md">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-gray-100">Rich Media</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Upload photos, write detailed notes, and create a comprehensive record of your travels.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Sign Up</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Create your free account to get started</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Document Trips</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Add your travels with photos and notes</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Use AI Assistant</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Get help planning your next adventure</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">4</div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Explore</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">View your travels on interactive maps</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who trust Voyage Vault to document and plan their adventures.
            </p>
            <Link
              href="/auth/signin"
              className="inline-block px-8 py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold rounded-lg transition-colors"
            >
              Get Started for Free
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

function AuthenticatedHomePage({ 
  userName, 
  loadingName, 
  tripStats, 
  loadingStats 
}: { 
  userName: string | null; 
  loadingName: boolean; 
  tripStats: TripStats | null; 
  loadingStats: boolean; 
}) {
  return (
    <>
      <NavBar />
      <main className="pt-20 bg-gray-50 dark:bg-gray-900 min-h-screen">
        {/* Welcome Header */}
        <section className="bg-white dark:bg-gray-800 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {loadingName ? (
                    "Welcome back!"
                  ) : userName ? (
                    `Welcome back, ${userName}!`
                  ) : (
                    "Welcome to your Travel Dashboard"
                  )}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Here&apos;s an overview of your travel adventures
                </p>
              </div>
              <div className="flex space-x-3">
                <Link
                  href="/trips"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  View All Trips
                </Link>
                <Link
                  href="/ai"
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Plan New Trip
                </Link>
              </div>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Stats and Quick Tips */}
            <div className="lg:col-span-1 space-y-6">
              {/* Travel Statistics */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Travel Stats
                </h2>
                {loadingStats ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    ))}
                  </div>
                ) : tripStats ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Total Trips</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{tripStats.totalTrips}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Photos Uploaded</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{tripStats.totalPhotos}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 dark:text-gray-400">Locations Pinned</span>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">{tripStats.totalLocations}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No trip data available</p>
                )}
              </div>

              {/* Quick Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  Quick Tips
                </h2>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Use the AI Companion to get personalized travel recommendations
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Add photos to your trips to make them more memorable
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Pin locations on the map to visualize your travel routes
                    </p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Write detailed notes to capture your travel experiences
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Map */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    Your Travel Map
                  </h2>
                  <Link
                    href="/trips"
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                  >
                    View individual trips
                  </Link>
                </div>
                <HomeMapSection />
              </div>
            </div>
          </div>

          {/* Recent Trips - Full Width Below Map */}
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Recent Trips
                </h2>
                <Link
                  href="/trips"
                  className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                >
                  View all
                </Link>
              </div>
              {loadingStats ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  ))}
                </div>
              ) : tripStats?.recentTrips.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tripStats.recentTrips.map((trip) => (
                    <Link
                      key={trip.id}
                      href={`/trips/${trip.id}`}
                      className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        {trip.coverPhoto ? (
                          <img
                            src={trip.coverPhoto}
                            alt={trip.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-lg flex items-center justify-center">
                            <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{trip.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No trips yet</p>
                  <Link
                    href="/trips"
                    className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Create your first trip
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
