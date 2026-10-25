import { NextRequest, NextResponse } from "next/server";
import { fundingAssistant } from "@/lib/ai/fundingAssistant";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, context } = body;

    if (!prompt) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }

    const result = await fundingAssistant.answerMerchantQuery(prompt, context || { profile: {} });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "AI assistant error" }, { status: 500 });
  }
}
