import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { SYSTEM_PROMPT, userPromptFor } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

type Item = { course: string; name: string; why: string };
type Order = { restaurant: string; items: Item[]; closing: string };

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "Set OPENAI_API_KEY in .env.local" }, { status: 500 });
  }

  let body: { cuisine?: string; mood?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const cuisine = body.cuisine?.trim();
  const mood = body.mood?.trim();
  if (!cuisine || !mood) {
    return NextResponse.json({ error: "cuisine and mood are required" }, { status: 400 });
  }
  if (cuisine.length > 80 || mood.length > 120) {
    return NextResponse.json({ error: "Keep it short" }, { status: 400 });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.85,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPromptFor(cuisine, mood) },
      ],
    });

    const text = completion.choices[0]?.message?.content?.trim() ?? "";
    let parsed: Order;
    try {
      parsed = JSON.parse(text) as Order;
    } catch {
      return NextResponse.json({ error: "Model returned non-JSON output", raw: text }, { status: 502 });
    }

    if (!parsed.restaurant || !Array.isArray(parsed.items) || parsed.items.length === 0 || !parsed.closing) {
      return NextResponse.json({ error: "Model output missing fields", raw: parsed }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status =
      typeof err === "object" && err && "status" in err
        ? (err as { status?: number }).status ?? 500
        : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
