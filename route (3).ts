import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST - Chấm công: đánh dấu một người đã hoàn thành công việc trong lượt hiện tại
export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: choreId } = await ctx.params;
    const body = await req.json();
    const { housemateId } = body;

    // Lấy chore hiện tại
    const chore = await prisma.chore.findUnique({
      where: { id: choreId },
    });
    if (!chore) {
      return NextResponse.json(
        { error: "Công việc không tồn tại" },
        { status: 404 }
      );
    }

    // Kiểm tra xem người này đã chấm trong lượt này chưa
    const existing = await prisma.choreLog.findUnique({
      where: {
        choreId_housemateId_round: {
          choreId,
          housemateId,
          round: chore.currentRound,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Bạn đã hoàn thành công việc này trong lượt này rồi!" },
        { status: 400 }
      );
    }

    // Tạo log chấm công
    const log = await prisma.choreLog.create({
      data: {
        choreId,
        housemateId,
        round: chore.currentRound,
      },
      include: { housemate: true },
    });

    // Đếm xem lượt này đã đủ 4 người chưa
    const totalMembers = await prisma.housemate.count();
    const logsInRound = await prisma.choreLog.count({
      where: {
        choreId,
        round: chore.currentRound,
      },
    });

    // Nếu đủ người → chuyển sang lượt mới
    let roundCompleted = false;
    if (logsInRound >= totalMembers) {
      await prisma.chore.update({
        where: { id: choreId },
        data: { currentRound: chore.currentRound + 1 },
      });
      roundCompleted = true;
    }

    return NextResponse.json(
      {
        log,
        roundCompleted,
        currentRound: roundCompleted
          ? chore.currentRound + 1
          : chore.currentRound,
        completedInRound: logsInRound,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Lỗi chấm công:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}

// DELETE - Hủy chấm công (undo)
export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id: choreId } = await ctx.params;
    const { searchParams } = new URL(req.url);
    const housemateId = searchParams.get("housemateId");
    const roundStr = searchParams.get("round");

    if (!housemateId || !roundStr) {
      return NextResponse.json(
        { error: "Thiếu thông tin" },
        { status: 400 }
      );
    }

    await prisma.choreLog.delete({
      where: {
        choreId_housemateId_round: {
          choreId,
          housemateId,
          round: parseInt(roundStr),
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Lỗi hủy chấm công:", error);
    return NextResponse.json({ error: "Lỗi server" }, { status: 500 });
  }
}
