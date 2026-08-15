import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser, verifyPassword, hashPassword } from "@/lib/auth";
import { ChangePasswordSchema } from "@/lib/validations";

// PUT /api/user/profile/password — change password
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = ChangePasswordSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = result.data;

    // Verify current password
    const currentUser = await prisma.user.findUnique({
      where: { id: user.sub },
      select: { passwordHash: true },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await verifyPassword(currentPassword, currentUser.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    // Hash new password and update
    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.sub },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("[USER/PROFILE/PASSWORD/PUT]", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
