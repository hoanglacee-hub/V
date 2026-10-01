import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        nodes: true,
        edges: true,
        finalArtifact: true,
      },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(
      { task },
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (error) {
    console.error("Failed to get task:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete task:", error);
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await req.json();
    const { nodeKey, assignedAi, promptInput, title, description } = body as {
      nodeKey: string;
      assignedAi?: string;
      promptInput?: string;
      title?: string;
      description?: string;
    };

    if (!nodeKey) {
      return NextResponse.json(
        { error: "nodeKey is required" },
        { status: 400 }
      );
    }

    // Find the node
    const node = await prisma.taskNode.findFirst({
      where: { taskId, nodeKey },
    });

    if (!node) {
      return NextResponse.json({ error: "Node not found" }, { status: 404 });
    }

    const updatedNode = await prisma.taskNode.update({
      where: { id: node.id },
      data: {
        ...(assignedAi !== undefined ? { assignedAi } : {}),
        ...(promptInput !== undefined ? { promptInput } : {}),
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
      },
    });

    return NextResponse.json(
      { node: updatedNode },
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (error) {
    console.error("Failed to update node:", error);
    return NextResponse.json(
      { error: "Failed to update node" },
      { status: 500 }
    );
  }
}
