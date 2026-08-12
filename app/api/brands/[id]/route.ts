import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// GET /api/brands/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const brand = await prisma.brand.findUnique({ where: { id } });
    if (!brand) return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    return NextResponse.json({ brand });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch brand" }, { status: 500 });
  }
}

// PATCH /api/brands/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    const body = await request.json();
    const brand = await prisma.brand.update({ where: { id }, data: body });
    return NextResponse.json({ brand });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to update brand" }, { status: 500 });
  }
}

// DELETE /api/brands/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { id } = await params;
    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === "P2025") return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    return NextResponse.json({ error: "Failed to delete brand" }, { status: 500 });
  }
}
