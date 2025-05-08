import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // Require auth
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch user profile
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Return profile data
  return NextResponse.json(user);
}

export async function PATCH(request: Request) {
  // Require auth
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate body
  const body = await request.json();
  const { name, image } = body as {
    name?: string;
    image?: string;
  };

  if (name === undefined && image === undefined) {
    return NextResponse.json(
      { error: "Nothing to update. Provide name or image." },
      { status: 400 }
    );
  }

  // Build update data
  const data: Prisma.UserUpdateInput = {};
  if (name !== undefined)  data.name  = name;
  if (image !== undefined) data.image = image;

  // Update the user record
  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  // Return the updated profile
  return NextResponse.json(updated);
}
