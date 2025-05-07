import TripDetailClient from "@/components/TripDetailClient";
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

  return <TripDetailClient trip={{
    id: trip.id,
    title: trip.title,
    date: trip.date.toISOString(),
    notes: trip.notes
  }} />;
}
