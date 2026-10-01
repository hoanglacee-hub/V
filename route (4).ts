import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Lấy danh sách thành viên
export async function GET() {
  try {
    const housemates = await prisma.housemate.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(housemates);
  } catch (error) {
    console.error("Lỗi lấy danh sách thành viên:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// POST - Thêm thành viên mới
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const count = await prisma.housemate.count();
    if (count >= 4) {
      return NextResponse.json(
        { error: "Tối đa 4 thành viên!" },
        { status: 400 }
      );
    }

    const housemate = await prisma.housemate.create({
      data: {
        name: body.name,
        emoji: body.emoji,
        color: body.color,
        order: count,
      },
    });

    return NextResponse.json(housemate, { status: 201 });
  } catch (error) {
    console.error("Lỗi thêm thành viên:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// PUT - Cập nhật thành viên (batch update)
export async function PUT(req: NextRequest) {
  try {
    const body: { id: string; name: string; emoji: string; color: string }[] =
      await req.json();

    for (let i = 0; i < body.length; i++) {
      await prisma.housemate.update({
        where: { id: body[i].id },
        data: {
          name: body[i].name,
          emoji: body[i].emoji,
          color: body[i].color,
          order: i,
        },
      });
    }

    const updated = await prisma.housemate.findMany({
      orderBy: { order: "asc" },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Lỗi cập nhật thành viên:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
