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
    const body = await request.json();
    const result = LoginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken({ sub: user.id });

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
    console.error("[AUTH/LOGIN]", error);

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

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
