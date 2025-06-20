import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { put } from "@vercel/blob";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  console.log("Upload API called"); // Debug log

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    console.log("No session found");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tripId = formData.get('tripId') as string;

    console.log("File:", file?.name, "TripId:", tripId); // Debug log

    if (!file || !tripId) {
      console.log("Missing file or tripId");
      return NextResponse.json(
        { error: "Missing file or tripId" },
        { status: 400 }
      );
    }

    // Verify trip ownership
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      select: { userId: true },
    });

    console.log("Trip found:", trip); // Debug log

    if (!trip || trip.userId !== session.user.id) {
      console.log("Trip not found or unauthorized");
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check if BLOB_READ_WRITE_TOKEN is available
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN not found");
      return NextResponse.json(
        { error: "Blob storage not configured" },
        { status: 500 }
      );
    }

    console.log("Uploading to Vercel Blob...");

    // Generate unique filename
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExtension}`;

    // Upload to Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
    });

    console.log("Blob uploaded:", blob.url);

    // Create photo record with blob URL
    const photo = await prisma.photo.create({
      data: {
        tripId,
        url: blob.url,
      },
      select: {
        id: true,
        url: true,
        createdAt: true,
        notes: true,
      },
    });

    console.log("Photo created in DB:", photo.id);

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error('Upload error details:', error);
    
    // Return more specific error information
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Upload failed with unknown error" },
      { status: 500 }
    );
  }
}