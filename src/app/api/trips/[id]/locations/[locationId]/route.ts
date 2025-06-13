import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Remove location from trip
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; locationId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: tripId, locationId } = await params;

    // Verify trip belongs to user and location exists
    const location = await prisma.location.findUnique({
      where: { id: locationId },
      include: {
        trip: {
          select: { userId: true }
        }
      }
    });

    if (!location || location.trip.userId !== session.user.id || location.tripId !== tripId) {
      return NextResponse.json({ error: "Location not found" }, { status: 404 });
    }

    // Delete location
    await prisma.location.delete({
      where: { id: locationId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error removing location:", error);
    return NextResponse.json({ error: "Failed to remove location" }, { status: 500 });
  }
}