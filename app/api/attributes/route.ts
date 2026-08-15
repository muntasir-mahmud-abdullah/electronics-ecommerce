import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const groups = await prisma.attributeGroup.findMany({
      include: {
        values: { orderBy: { sortOrder: "asc" } },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ groups });
  } catch (error) {
    console.error("[ATTRIBUTES/GET]", error);
    return NextResponse.json({ error: "Failed to fetch attributes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, unit, isFilterable, isVariantDefining, sortOrder } = body;
    
    if (!name || typeof name !== "string") {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    const group = await prisma.attributeGroup.create({
      data: {
        name,
        unit: unit || null,
        isFilterable: isFilterable !== undefined ? isFilterable : true,
        isVariantDefining: isVariantDefining !== undefined ? isVariantDefining : false,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
    });

    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    console.error("[ATTRIBUTES/POST]", error);
    return NextResponse.json({ error: "Failed to create attribute group" }, { status: 500 });
  }
}
