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
    const body = await request.json();
    const result = RegisterSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, phone, password } = result.data;

    // Check if user already exists
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, ...(phone ? [{ phone }] : [])] },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email or phone already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

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

    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    const accessToken = await signAccessToken(tokenPayload);
    const refreshToken = await signRefreshToken({ sub: user.id });

    const response = NextResponse.json({ user, accessToken }, { status: 201 });
    setRefreshCookie(response, refreshToken);
    return response;
  } catch (error: any) {
    console.error("[AUTH/REGISTER]", error);

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
