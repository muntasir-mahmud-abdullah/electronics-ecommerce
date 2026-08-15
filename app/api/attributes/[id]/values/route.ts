import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function POST(
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
    const { value, sortOrder } = body;
    
    if (!value || typeof value !== "string") {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    const attributeValue = await prisma.attributeValue.create({
      data: {
        groupId: id,
        value,
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      },
    });

    return NextResponse.json({ value: attributeValue }, { status: 201 });
  } catch (error) {
    console.error("[ATTRIBUTES/[id]/VALUES/POST]", error);
    return NextResponse.json({ error: "Failed to create attribute value" }, { status: 500 });
  }
}
