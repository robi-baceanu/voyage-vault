import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Auth
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse the incoming messages array
    const { messages } = await request.json() as {
      messages: { role: "USER" | "ASSISTANT"; content: string }[];
    };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Please provide a non-empty messages array." },
        { status: 400 }
      );
    }

    // Persist the last user message
    const last = messages[messages.length - 1];
    if (last.role === "USER") {
      await prisma.chatMessage.create({
        data: {
          role: "USER",
          content: last.content,
          userId: session.user.id,
        },
      });
    }

    // Call OpenAI Chat Completion
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages.map((m) => ({
        role: m.role.toLowerCase() as "user" | "assistant",
        content: m.content,
      })),
    });

    const reply = completion.choices?.[0]?.message?.content;
    if (!reply) throw new Error("No reply from OpenAI");

    // Persist assistant response
    await prisma.chatMessage.create({
      data: {
        role: "ASSISTANT",
        content: reply,
        userId: session.user.id,
      },
    });

    // Return the assistant’s reply
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error("AI route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  // Auth
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Load and return this user’s messages, oldest first
  const history = await prisma.chatMessage.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
    select: { role: true, content: true },
  });

  return NextResponse.json(history);
}
