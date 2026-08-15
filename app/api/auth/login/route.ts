import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  setRefreshCookie,
} from "@/lib/auth";
import { LoginSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    console.log("[AUTH/LOGIN] Starting login process");

    const body = await request.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      console.log(
        "[AUTH/LOGIN] Validation failed:",
        result.error.flatten().fieldErrors,
      );
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;
    console.log("[AUTH/LOGIN] Attempting login for email:", email);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      console.log("[AUTH/LOGIN] User not found or inactive");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    console.log("[AUTH/LOGIN] Verifying password");
    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      console.log("[AUTH/LOGIN] Invalid password");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    console.log("[AUTH/LOGIN] Password verified, creating tokens");
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken({ sub: user.id });

    console.log("[AUTH/LOGIN] Tokens created successfully");

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
    setRefreshCookie(response, refreshToken);
    return response;
  } catch (error: any) {
    console.error("[AUTH/LOGIN] Error:", error);
    console.error("[AUTH/LOGIN] Error message:", error?.message);
    console.error("[AUTH/LOGIN] Error stack:", error?.stack);

    // Provide more specific error messages for debugging
    if (
      error.message?.includes("JWT_SECRET") ||
      error.message?.includes("JWT_REFRESH_SECRET")
    ) {
      return NextResponse.json(
        { error: "Server configuration error: Missing JWT secrets" },
        { status: 500 },
      );
    }

    if (error.message?.includes("DATABASE_URL")) {
      return NextResponse.json(
        { error: "Server configuration error: Database not configured" },
        { status: 500 },
      );
    }

    // Return more detailed error in development
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        { error: "Internal server error", details: error?.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
