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

    // Get all trips for the user with counts
    const trips = await prisma.trip.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { 
            photos: true,
            locations: true
          }
        },
        coverPhoto: {
          select: {
            url: true
          }
        }
      }
    });

    // Calculate simple statistics
    const totalTrips = trips.length;
    const totalPhotos = trips.reduce((sum, trip) => sum + trip._count.photos, 0);
    const totalLocations = trips.reduce((sum, trip) => sum + trip._count.locations, 0);
    
    // Get recent trips (last 3 for the sidebar)
    const recentTrips = trips
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map(trip => ({
        id: trip.id,
        title: trip.title,
        startDate: trip.startDate.toISOString(),
        endDate: trip.endDate.toISOString(),
        coverPhoto: trip.coverPhoto?.url || undefined
      }));

    return NextResponse.json({
      totalTrips,
      totalPhotos,
      totalLocations,
      recentTrips
    });
  } catch (error) {
    console.error("Error fetching trip stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch trip statistics" },
      { status: 500 }
    );
  }
}