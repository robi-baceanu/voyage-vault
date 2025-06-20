import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all locations for a trip
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tripId } = await params;

    // Verify trip belongs to user
    const trip = await prisma.trip.findUnique({
      where: { 
        id: tripId,
        userId: session.user.id 
      }
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Get locations for this trip
    const locations = await prisma.location.findMany({
      where: { tripId },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json(locations);

  } catch (error) {
    console.error("Error fetching locations:", error);
    return NextResponse.json({ error: "Failed to fetch locations" }, { status: 500 });
  }
}

// Add location to trip
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tripId } = await params;
    const { latitude, longitude, name } = await request.json();

    // Validate input
    if (!latitude || !longitude || !name) {
      return NextResponse.json({ 
        error: "Latitude, longitude, and name are required" 
      }, { status: 400 });
    }

    // Verify trip belongs to user
    const trip = await prisma.trip.findUnique({
      where: { 
        id: tripId,
        userId: session.user.id 
      }
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    // Create location
    const location = await prisma.location.create({
      data: {
        tripId,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        name: name.trim()
      }
    });

    return NextResponse.json(location, { status: 201 });

  } catch (error) {
    console.error("Error adding location:", error);
    return NextResponse.json({ error: "Failed to add location" }, { status: 500 });
  }
}