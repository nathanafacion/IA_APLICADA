import { NextRequest, NextResponse } from "next/server";
import { fetchInterestOverTime } from "@/features/trends/services/trendsService";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");

  if (!query || typeof query !== "string") {
    return NextResponse.json(
      { error: "O parâmetro 'q' é obrigatório." },
      { status: 400 }
    );
  }

  const data = await fetchInterestOverTime(query);
  return NextResponse.json(data);
}
