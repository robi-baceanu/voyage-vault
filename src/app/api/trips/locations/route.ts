import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all trips belonging to the user with their locations
    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        locations: true,
        coverPhoto: {
          select: {
            url: true
          }
        }
      }
    });

    // Flatten all locations from all trips
    const allLocations = trips.flatMap(trip => 
      trip.locations.map(location => ({
        id: trip.id,
        title: trip.title,
        latitude: location.latitude,
        longitude: location.longitude,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        coverPhoto: trip.coverPhoto?.url || undefined,
        locationName: location.name
      }))
    );

    return NextResponse.json(allLocations);
  } catch (error) {
    console.error("Error fetching trip locations:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip locations" },
      { status: 500 }
    );
  }
}