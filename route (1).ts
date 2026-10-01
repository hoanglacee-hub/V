import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Lấy danh sách công việc + trạng thái lượt hiện tại
export async function GET() {
  try {
    const chores = await prisma.chore.findMany({
      where: { isActive: true },
      include: {
        logs: {
          orderBy: { completedAt: "desc" },
          include: { housemate: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(chores);
  } catch (error) {
    console.error("Lỗi lấy danh sách công việc:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST - Thêm công việc mới
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const chore = await prisma.chore.create({
      data: {
        name: body.name,
        emoji: body.emoji || "📋",
      },
    });

    return NextResponse.json(chore, { status: 201 });
  } catch (error) {
    console.error("Lỗi thêm công việc:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
