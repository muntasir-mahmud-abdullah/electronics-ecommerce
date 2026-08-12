import { NextRequest, NextResponse } from "next/server";
import { clearRefreshCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  clearRefreshCookie(response);
  return response;
}
