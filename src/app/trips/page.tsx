import NavBar from "@/components/NavBar";
import AddTripModal from "@/components/AddTripModal";
import TripCard from "@/components/TripCard";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function TripsPage() {
  // Protect route
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Load the user’s trips
  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: "desc" },
    include: { coverPhoto: true },
  });

  return (
    <>
      {/* Shared header + drawer */}
      <NavBar />

      {/* Add trip button and modal */}
      <AddTripModal />

      {/* Page content */}
      <main className="pt-20 min-h-screen bg-white dark:bg-gray-900 p-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
          Your Trips
        </h1>

        {trips.length === 0 ? (
          <p className="text-gray-900 dark:text-gray-100">
            You haven’t created any trips yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trips.map((trip) => (
              <Link
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="block"
              >
                <TripCard trip={trip} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
