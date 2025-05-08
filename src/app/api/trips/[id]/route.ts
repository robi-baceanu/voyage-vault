import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { title, date, notes, latitude, longitude } = body;

  // Verify ownership
  const existing = await prisma.trip.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Build update object dynamically
  const data: Prisma.TripUncheckedUpdateInput = {};
  if (title  !== undefined) data.title     = title;
  if (date   !== undefined) data.date      = new Date(date);
  if (notes  !== undefined) data.notes     = notes;
  if (latitude  !== undefined) data.latitude  = latitude;
  if (longitude !== undefined) data.longitude = longitude;

  if (Object.keys(data).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update" },
      { status: 400 }
    );
  }

  // Perform update
  const updated = await prisma.trip.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Auth
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = params;

  // Ownership check
  const trip = await prisma.trip.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete
  await prisma.trip.delete({ where: { id } });

  // Respond
  return NextResponse.json({ success: true });
}
