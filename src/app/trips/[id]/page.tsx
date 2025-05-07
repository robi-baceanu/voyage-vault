import NavBar from "@/components/NavBar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TripDetailPageProps {
  params: { id: string };
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  // Protect route
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch the trip
  const trip = await prisma.trip.findUnique({
    where: { id: params.id },
  });

  if (!trip) {
    // Trip not found → back to list
    redirect("/trips");
  }

  return (
    <>
      <NavBar />

      <main className="pt-20 min-h-screen bg-white dark:bg-gray-900 p-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {trip.title}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {new Date(trip.date).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
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
        </div>
      </main>
    </>
  );
}
