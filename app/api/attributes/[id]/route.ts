import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

// DELETE /api/attributes/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;

    // Check if any product attributes use values from this group
    const usedCount = await prisma.productAttribute.count({
      where: { attributeValue: { groupId: id } },
    });

    if (usedCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete: this attribute group is used by existing products." },
        { status: 400 }
      );
    }

    // Delete values then group
    await prisma.$transaction([
      prisma.attributeValue.deleteMany({ where: { groupId: id } }),
      prisma.categoryAttributeMap.deleteMany({ where: { attributeGroupId: id } }),
      prisma.attributeGroup.delete({ where: { id } }),
    ]);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[ATTRIBUTES/DELETE]", error);
    return NextResponse.json({ error: "Failed to delete attribute group" }, { status: 500 });
  }
}

// PATCH /api/attributes/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, unit, isFilterable, isVariantDefining } = body;

    const group = await prisma.attributeGroup.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(unit !== undefined && { unit }),
        ...(isFilterable !== undefined && { isFilterable }),
        ...(isVariantDefining !== undefined && { isVariantDefining }),
      },
    });

    return NextResponse.json({ group });
  } catch (error) {
    console.error("[ATTRIBUTES/PATCH]", error);
    return NextResponse.json({ error: "Failed to update attribute group" }, { status: 500 });
  }
}
