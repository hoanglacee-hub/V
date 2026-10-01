import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT - Sửa công việc
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();

    const chore = await prisma.chore.update({
      where: { id },
      data: {
        name: body.name,
        emoji: body.emoji,
      },
    });

    return NextResponse.json(chore);
  } catch (error) {
    console.error("Lỗi cập nhật công việc:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// DELETE - Xóa (soft delete) công việc
export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params;

    await prisma.chore.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi xóa công việc:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
