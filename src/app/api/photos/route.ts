import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Grab tripId from URL: /api/photos?tripId=...
  const { searchParams } = new URL(request.url);
  const tripId = searchParams.get("tripId");
  if (!tripId) {
    return NextResponse.json(
      { error: "Missing tripId parameter" },
      { status: 400 }
    );
  }

  // Ensure the trip belongs to this user
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch and return the photos with notes field included
  const photos = await prisma.photo.findMany({
    where: { tripId },
    select: {
      id: true,
      url: true,
      createdAt: true,
      notes: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(photos);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { tripId, url } = await request.json();
  if (!tripId || !url) {
    return NextResponse.json(
      { error: "Missing required fields: tripId and url" },
      { status: 400 }
    );
  }

  // Ensure the trip belongs to this user
  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    select: { userId: true },
  });
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Create the photo record
  const photo = await prisma.photo.create({
    data: {
      tripId,
      url,
    },
  });

  return NextResponse.json(photo, { status: 201 });
}

export async function DELETE(request: Request) {
  // Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body, expect { id: string }
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json(
      { error: "Missing photo id" },
      { status: 400 }
    );
  }

  // Verify ownership: fetch the photo + its trip.userId
  const photo = await prisma.photo.findUnique({
    where: { id },
    select: { trip: { select: { userId: true } } },
  });
  if (!photo || photo.trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete the record
  await prisma.photo.delete({ where: { id } });

  // Respond
  return NextResponse.json({ success: true });
}
