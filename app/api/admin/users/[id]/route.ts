import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { UpdateUserSchema } from "@/lib/validations";

// GET /api/admin/users/[id] — fetch single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const userDetails = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    if (!userDetails) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: userDetails });
  } catch (error) {
    console.error("[ADMIN/USERS/[id]/GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 },
    );
  }
}

// PATCH /api/admin/users/[id] — update user status/role
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const result = UpdateUserSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { name, email, phone, role, isActive } = result.data;

    // Check if email is being changed and if it's already taken
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (email !== existingUser.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email } });
      if (emailTaken) {
        return NextResponse.json(
          { error: "Email already in use" },
          { status: 409 },
        );
      }
    }

    // Check if phone is being changed and if it's already taken
    if (phone && phone !== existingUser.phone) {
      const phoneTaken = await prisma.user.findUnique({ where: { phone } });
      if (phoneTaken) {
        return NextResponse.json(
          { error: "Phone number already in use" },
          { status: 409 },
        );
      }
    }

    // Prevent super admins from being deactivated by non-super admins
    if (existingUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot modify super admin accounts" },
        { status: 403 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { name, email, phone, role, isActive },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[ADMIN/USERS/[id]/PATCH]", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE /api/admin/users/[id] — deactivate user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser(request);
    if (!user || (user.role !== "SUPER_ADMIN" && user.role !== "MANAGER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent super admins from being deactivated by non-super admins
    if (existingUser.role === "SUPER_ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "Cannot deactivate super admin accounts" },
        { status: 403 },
      );
    }

    // Prevent self-deactivation
    if (id === user.sub) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account" },
        { status: 400 },
      );
    }

    // Deactivate user instead of deleting
    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("[ADMIN/USERS/[id]/DELETE]", error);
    return NextResponse.json(
      { error: "Failed to deactivate user" },
      { status: 500 },
    );
  }
}
