import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// POST /api/auth/signup
export async function POST(request: Request) {
  const { name, email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 }
    );
  }

  // Check for existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "User already exists" },
      { status: 409 }
    );
  }

  // Hash the password
  const hashed = await bcrypt.hash(password, 10);

  // Create the user
  await prisma.user.create({
    data: { name, email, password: hashed },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
