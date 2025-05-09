// src/app/api/ai/route.ts

import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
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

    // Return the assistant’s reply
    return NextResponse.json({ reply });
  } catch (err: unknown) {
    console.error("AI route error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
