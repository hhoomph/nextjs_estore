import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";

export async function GET(request: NextRequest) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error("Auth GET error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    return await auth.handler(request);
  } catch (error) {
    console.error("Auth POST error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 },
    );
  }
}
