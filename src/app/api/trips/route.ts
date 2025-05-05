import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
    // Check session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  
    // Fetch trips belonging to this user, newest first
    const trips = await prisma.trip.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });
  
    // Return the list as JSON
    return NextResponse.json(trips);
}

export async function POST(request: Request) {
    // Verify session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
        );
    }

    // Parse and validate input
    const { title, date, notes, latitude, longitude } = await request.json();
    if (!title || !date) {
        return NextResponse.json(
        { error: "Missing required fields: title and date" },
        { status: 400 }
        );
    }

    // Create the trip
    const newTrip = await prisma.trip.create({
        data: {
        userId:    session.user.id,
        title,
        date:      new Date(date),
        notes:     notes     ?? null,
        latitude:  latitude  ?? null,
        longitude: longitude ?? null,
        },
    });

    // Respond with the created trip
    return NextResponse.json(newTrip, { status: 201 });
}
  