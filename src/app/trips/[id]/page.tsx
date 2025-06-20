import TripDetailClient from "@/components/TripDetailClient";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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
    include: {
      photos: true,
      coverPhoto: true,
    },
  });

  if (!trip) {
    // Trip not found → back to list
    redirect("/trips");
  }

  return <TripDetailClient trip={{
    id: trip.id,
    title: trip.title,
    startDate: trip.startDate.toISOString(),
    endDate: trip.endDate.toISOString(),
    notes: trip.notes,
    coverPhotoId: trip.coverPhotoId ?? null,
    coverPhotoUrl: trip.coverPhoto?.url ?? null
  }} />;
}
