import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decomposeTask } from "@/lib/orchestrator";
import { ApiKeyConfig } from "@/lib/types";
import { WORKFLOW_PRESETS } from "@/lib/workflow-presets";

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        nodes: true,
        edges: true,
        finalArtifact: true,
      },
    });

    return NextResponse.json(
      { tasks },
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (error) {
    console.error("Failed to fetch tasks:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, autoExecute = false, apiKeys = {}, presetId } = body as {
      prompt: string;
      autoExecute?: boolean;
      apiKeys?: ApiKeyConfig;
      presetId?: string;
    };

    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // 1. Ensure default workspace exists
    let workspace = await prisma.workspace.findFirst();
    if (!workspace) {
      workspace = await prisma.workspace.create({
        data: {
          title: "Không gian làm việc chính (Default)",
        },
      });
    }

    // 2. Decompose prompt into DAG (or use selected preset template)
    let decomposition;
    if (presetId) {
      const preset = WORKFLOW_PRESETS.find((p) => p.id === presetId);
      if (preset) {
        decomposition = {
          taskGoal: prompt.trim(),
          nodes: preset.nodes.map((n) => ({
            ...n,
            promptTemplate: `${n.promptTemplate} "${prompt.trim()}"`,
          })),
          edges: preset.edges,
        };
      }
    }

    if (!decomposition) {
      decomposition = await decomposeTask(prompt, apiKeys);
    }

    // 3. Save Task, Nodes, and Edges in Database
    const task = await prisma.task.create({
      data: {
        workspaceId: workspace.id,
        prompt: prompt.trim(),
        status: "READY",
        autoExecute: Boolean(autoExecute),
        nodes: {
          create: decomposition.nodes.map((node) => ({
            nodeKey: node.id,
            title: node.title,
            description: node.description,
            assignedAi: node.suggestedModel,
            promptInput: node.promptTemplate || node.description,
            status: "PENDING",
          })),
        },
        edges: {
          create: decomposition.edges.map((edge) => ({
            fromNodeKey: edge.from,
            toNodeKey: edge.to,
          })),
        },
      },
      include: {
        nodes: true,
        edges: true,
        finalArtifact: true,
      },
    });

    return NextResponse.json(
      { task },
      { headers: { "Content-Type": "application/json; charset=utf-8" } }
    );
  } catch (error) {
    console.error("Failed to create task:", error);
    return NextResponse.json(
      { error: "Failed to decompose and create task" },
      { status: 500 }
    );
  }
}
