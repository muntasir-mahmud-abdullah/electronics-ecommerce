import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { Role } from "@prisma/client";

// Validate environment variables
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}
if (!process.env.JWT_REFRESH_SECRET) {
  throw new Error("JWT_REFRESH_SECRET environment variable is not set");
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET,
);

export interface JWTPayload {
  sub: string; // user id
  email: string;
  role: Role;
  name: string;
  phone?: string;
}

// ─── Token creation ───────────────────────────────────────────────────────────

export async function signAccessToken(payload: JWTPayload): Promise<string> {
  try {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(JWT_SECRET);
  } catch (error) {
    console.error("[AUTH] Failed to sign access token:", error);
    throw new Error("Failed to generate access token");
  }
}

export async function signRefreshToken(
  payload: Pick<JWTPayload, "sub">,
): Promise<string> {
  try {
    return new SignJWT({ ...payload })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_REFRESH_SECRET);
  } catch (error) {
    console.error("[AUTH] Failed to sign refresh token:", error);
    throw new Error("Failed to generate refresh token");
  }
}

// ─── Token verification ───────────────────────────────────────────────────────

export async function verifyAccessToken(
  token: string,
): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ sub: string } | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as unknown as { sub: string };
  } catch {
    return null;
  }
}

// ─── Password helpers ─────────────────────────────────────────────────────────

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Auth helper for route handlers ──────────────────────────────────────────

export async function getAuthUser(
  request: NextRequest,
): Promise<JWTPayload | null> {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) return null;
  return verifyAccessToken(token);
}

export function requireRole(allowedRoles: Role[]) {
  return async function withRole(
    request: NextRequest,
    handler: (req: NextRequest, user: JWTPayload) => Promise<NextResponse>,
  ): Promise<NextResponse> {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return handler(request, user);
  };
}

// ─── Refresh token cookie helpers ─────────────────────────────────────────────

export const REFRESH_TOKEN_COOKIE = "gadgethub_refresh";

export function setRefreshCookie(response: NextResponse, token: string): void {
  response.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export function clearRefreshCookie(response: NextResponse): void {
  response.cookies.set(REFRESH_TOKEN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}
