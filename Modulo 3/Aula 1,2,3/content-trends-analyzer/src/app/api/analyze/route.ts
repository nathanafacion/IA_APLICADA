import { NextRequest, NextResponse } from "next/server";
import { analyzeContent } from "@/features/analyzer/services/analyzeContent";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, description } = body;

  if (!title || typeof title !== "string") {
    return NextResponse.json(
      { error: "O campo 'title' é obrigatório." },
      { status: 400 }
    );
  }

  const result = await analyzeContent(title, description ?? "");
  return NextResponse.json(result);
}
