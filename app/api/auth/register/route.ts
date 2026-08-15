import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  signAccessToken,
  signRefreshToken,
  setRefreshCookie,
} from "@/lib/auth";
import { RegisterSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    console.log("[AUTH/REGISTER] Starting registration process");

    const body = await request.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      console.log(
        "[AUTH/REGISTER] Validation failed:",
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

    const { name, email, phone, password } = result.data;
    console.log("[AUTH/REGISTER] Creating user for email:", email);

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });

    if (existing) {
      console.log("[AUTH/REGISTER] User already exists");
      return NextResponse.json(
        { error: "An account with this email or phone already exists" },
        { status: 409 },
      );
    }

    console.log("[AUTH/REGISTER] Hashing password");
    const passwordHash = await hashPassword(password);

    console.log("[AUTH/REGISTER] Creating user in database");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        role: "CUSTOMER",
      },
      select: { id: true, name: true, email: true, phone: true, role: true },
    });

    console.log("[AUTH/REGISTER] User created successfully:", user.id);

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    console.log("[AUTH/REGISTER] Signing tokens");
    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken({ sub: user.id });

    console.log("[AUTH/REGISTER] Tokens signed successfully");

    const response = NextResponse.json({ user, accessToken }, { status: 201 });
    setRefreshCookie(response, refreshToken);
    return response;
  } catch (error: any) {
    console.error("[AUTH/REGISTER] Error:", error);
    console.error("[AUTH/REGISTER] Error message:", error?.message);
    console.error("[AUTH/REGISTER] Error stack:", error?.stack);

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
