import TripDetailClient from "@/components/TripDetailClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function TripDetailPage({ params }: { params: Promise<{ id: string }>}) {
  const { id } = await params;

  // Protect route
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Fetch the trip
  const trip = await prisma.trip.findUnique({
    where: { id },
  });

  if (!trip) {
    // Trip not found → back to list
    redirect("/trips");
  }

  return <TripDetailClient trip={{
    id: trip.id,
    title: trip.title,
    date: trip.date.toISOString(),
    notes: trip.notes,
    latitude: trip.latitude ?? null,
    longitude: trip.longitude ?? null,
  }} />;
}
