import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeNode, synthesizeRefinedArtifact } from "@/lib/orchestrator";
import { ApiKeyConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  let instruction = "";
  let apiKeys: ApiKeyConfig = {};

  try {
    const body = await req.json();
    instruction = (body.instruction || body.message || "").trim();
    if (body.apiKeys) apiKeys = body.apiKeys;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!instruction) {
    return new Response(JSON.stringify({ error: "Instruction is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      nodes: { orderBy: { createdAt: "asc" } },
      edges: true,
      finalArtifact: true,
    },
  });

  if (!task) {
    return new Response(JSON.stringify({ error: "Task not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Set up SSE stream for real-time workflow execution
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      try {
        sendEvent("refine_start", {
          taskId,
          instruction,
          timestamp: new Date().toISOString(),
        });

        // 1. Calculate iteration index
        const iterCount = Math.floor(
          task.nodes.filter((n) => n.nodeKey.startsWith("iter_")).length / 3
        );
        const iterationIndex = iterCount + 1;

        // Last existing node to link
        const lastNodeKey =
          task.nodes.length > 0 ? task.nodes[task.nodes.length - 1].nodeKey : null;

        const keyArch = `iter_${iterationIndex}_arch`;
        const keyCode = `iter_${iterationIndex}_code`;
        const keyQa = `iter_${iterationIndex}_qa`;

        // 2. Create 3 new specialized refinement nodes in DB
        const createdNodes = await Promise.all([
          prisma.taskNode.create({
            data: {
              taskId,
              nodeKey: keyArch,
              title: `[Can thiệp #${iterationIndex}] Phân tích Kiến trúc & Tác động`,
              description: `Phân tích yêu cầu "${instruction}" và mô hình hóa giải pháp kỹ thuật.`,
              assignedAi: "gemini-3-8-flash",
              status: "PENDING",
              promptInput: `Phân tích tác động và thiết kế giải pháp cho lệnh điều hành: "${instruction}".`,
            },
          }),
          prisma.taskNode.create({
            data: {
              taskId,
              nodeKey: keyCode,
              title: `[Can thiệp #${iterationIndex}] Lập trình Hiện thực hóa Mã nguồn`,
              description: `Viết mã nguồn chi tiết, triển khai tính năng "${instruction}".`,
              assignedAi: "qwen-2.5-coder-32b",
              status: "PENDING",
              promptInput: `Lập trình hoàn chỉnh tính năng: "${instruction}". Đảm bảo code sạch, tối ưu và chuẩn TypeScript/React.`,
            },
          }),
          prisma.taskNode.create({
            data: {
              taskId,
              nodeKey: keyQa,
              title: `[Can thiệp #${iterationIndex}] Thẩm định & Kiểm thử Tính năng`,
              description: `Kiểm tra tính nhất quán, bảo mật và khả năng tương thích của tính năng "${instruction}".`,
              assignedAi: "llama-3.3-70b",
              status: "PENDING",
              promptInput: `Thẩm định bảo mật và tương thích cho tính năng: "${instruction}".`,
            },
          }),
        ]);

        // 3. Create edges connecting nodes in workflow DAG
        const edgesToCreate = [
          ...(lastNodeKey ? [{ fromNodeKey: lastNodeKey, toNodeKey: keyArch }] : []),
          { fromNodeKey: keyArch, toNodeKey: keyCode },
          { fromNodeKey: keyCode, toNodeKey: keyQa },
        ];

        const createdEdges = await Promise.all(
          edgesToCreate.map((e) =>
            prisma.taskEdge.create({
              data: {
                taskId,
                fromNodeKey: e.fromNodeKey,
                toNodeKey: e.toNodeKey,
              },
            })
          )
        );

        // Notify client that new workflow nodes have been added to DAG
        sendEvent("nodes_added", {
          newNodes: createdNodes,
          newEdges: createdEdges,
        });

        // 4. Sequentially execute the 3 nodes in the refinement pipeline
        const completedOutputs: Record<string, string> = {};

        for (const readyNode of createdNodes) {
          // Send RUNNING event
          await prisma.taskNode.update({
            where: { id: readyNode.id },
            data: { status: "RUNNING" },
          });

          sendEvent("node_update", {
            nodeKey: readyNode.nodeKey,
            status: "RUNNING",
            title: readyNode.title,
            assignedAi: readyNode.assignedAi,
          });

          // Context includes previous outputs and the instruction
          const contextForNode: Record<string, string> = {
            ...completedOutputs,
            userInstruction: instruction,
            currentArtifactSummary: task.finalArtifact?.content.slice(0, 1500) || "",
          };

          try {
            const res = await executeNode(readyNode, contextForNode, apiKeys);

            await prisma.taskNode.update({
              where: { id: readyNode.id },
              data: {
                status: "COMPLETED",
                rawOutput: res.output,
                tokensUsed: res.tokensUsed,
                latencyMs: res.latencyMs,
              },
            });

            completedOutputs[readyNode.nodeKey] = res.output;

            sendEvent("node_update", {
              nodeKey: readyNode.nodeKey,
              status: "COMPLETED",
              title: readyNode.title,
              assignedAi: readyNode.assignedAi,
              output: res.output,
              latencyMs: res.latencyMs,
            });
          } catch (err) {
            console.error(`Refine node ${readyNode.nodeKey} failed:`, err);
            await prisma.taskNode.update({
              where: { id: readyNode.id },
              data: { status: "FAILED" },
            });
            sendEvent("node_update", {
              nodeKey: readyNode.nodeKey,
              status: "FAILED",
              title: readyNode.title,
            });
          }
        }

        // 5. Synthesize updated artifact
        sendEvent("synthesis_start", {
          message: `Chuỗi 3 AI can thiệp đã hoàn tất! Đang tích hợp tính năng "${instruction}" vào mã nguồn sản phẩm...`,
        });

        const iterationResults = createdNodes.map((n) => ({
          nodeKey: n.nodeKey,
          title: n.title,
          assignedAi: n.assignedAi,
          output: completedOutputs[n.nodeKey] || "Đã hoàn tất",
        }));

        const updatedArtifactContent = await synthesizeRefinedArtifact(
          task.prompt,
          task.finalArtifact?.content || "",
          instruction,
          iterationResults,
          apiKeys
        );

        // Update artifact in DB
        const savedArtifact = await prisma.artifact.upsert({
          where: { taskId },
          create: {
            taskId,
            type: "MARKDOWN",
            content: updatedArtifactContent,
          },
          update: {
            content: updatedArtifactContent,
          },
        });

        sendEvent("artifact_completed", {
          artifact: savedArtifact,
        });

        sendEvent("refine_completed", {
          success: true,
          message: `Lệnh điều hành "${instruction}" đã được thực thi thành công qua chuỗi 3 AI chuyên trách!`,
        });
      } catch (streamErr) {
        console.error("Refine SSE stream error:", streamErr);
        sendEvent("error", { message: "Lỗi trong quá trình điều phối can thiệp" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
