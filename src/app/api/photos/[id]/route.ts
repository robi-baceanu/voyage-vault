import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const photoId = params.id;

  // Verify ownership: fetch the photo + its trip.userId
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { trip: { select: { userId: true } } },
  });
  if (!photo || photo.trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete the record
  await prisma.photo.delete({ where: { id: photoId } });

  return NextResponse.json({ success: true });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const photoId = params.id;
  const { notes } = await request.json();

  // Verify ownership: fetch the photo + its trip.userId
  const photo = await prisma.photo.findUnique({
    where: { id: photoId },
    select: { trip: { select: { userId: true } } },
  });
  if (!photo || photo.trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Update the photo with the new notes
  const updatedPhoto = await prisma.photo.update({
    where: { id: photoId },
    data: { notes: notes || null },
  });

  return NextResponse.json(updatedPhoto);
}