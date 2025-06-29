import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
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
  const { title, startDate, endDate, notes, coverPhotoId } = body;

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
  if (title       !== undefined) data.title     = title;
  if (startDate   !== undefined) data.startDate = new Date(startDate);
  if (endDate     !== undefined) data.endDate      = new Date(endDate);
  if (notes       !== undefined) data.notes     = notes;
  if (coverPhotoId !== undefined) data.coverPhotoId = coverPhotoId;

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
  { params }: { params: Promise<{ id: string }> }
) {
  // Auth
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
