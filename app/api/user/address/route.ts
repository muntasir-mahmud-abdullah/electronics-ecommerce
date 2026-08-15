import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { AddressSchema } from "@/lib/validations";

// GET /api/user/address — fetch user's saved address
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const address = await prisma.address.findFirst({
      where: { userId: user.sub },
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("[USER/ADDRESS/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch address" },
      { status: 500 },
    );
  }
}

// POST /api/user/address — create or update user's address
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = AddressSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const addressData = result.data;

    // Check if user already has an address
    const existingAddress = await prisma.address.findFirst({
      where: { userId: user.sub },
    });

    let address;

    if (existingAddress) {
      // Update existing address
      address = await prisma.address.update({
        where: { id: existingAddress.id },
        data: addressData,
      });
    } else {
      // Create new address
      address = await prisma.address.create({
        data: {
          ...addressData,
          userId: user.sub,
        },
      });
    }

    return NextResponse.json({ address });
  } catch (error) {
    console.error("[USER/ADDRESS/POST]", error);
    return NextResponse.json(
      { error: "Failed to save address" },
      { status: 500 },
    );
  }
}

// DELETE /api/user/address — remove user's address
export async function DELETE(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const address = await prisma.address.findFirst({
      where: { userId: user.sub },
    });

    if (!address) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: address.id },
    });

    return NextResponse.json({ message: "Address removed successfully" });
  } catch (error) {
    console.error("[USER/ADDRESS/DELETE]", error);
    return NextResponse.json(
      { error: "Failed to remove address" },
      { status: 500 },
    );
  }
}
