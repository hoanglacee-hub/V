import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeNode, synthesizeOutputs } from "@/lib/orchestrator";
import { ApiKeyConfig } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const { taskId } = await params;
  let apiKeys: ApiKeyConfig = {};

  try {
    const body = await req.json();
    if (body.apiKeys) {
      apiKeys = body.apiKeys;
    }
  } catch {
    // Body is optional
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      nodes: true,
      edges: true,
    },
  });

  if (!task) {
    return new Response(JSON.stringify({ error: "Task not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Set up SSE stream
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, data: unknown) => {
        const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
        controller.enqueue(encoder.encode(payload));
      };

      try {
        // 1. Mark task as RUNNING
        await prisma.task.update({
          where: { id: taskId },
          data: { status: "RUNNING" },
        });
        sendEvent("task_status", { status: "RUNNING", taskId });

        // 2. Prepare DAG graph data
        const nodes = task.nodes;
        const edges = task.edges;

        const completedOutputs: Record<string, string> = {};
        const runningNodes = new Set<string>();
        const finishedNodes = new Set<string>();

        // Build dependency map: which nodes must complete before `nodeKey` can run
        const dependencies: Record<string, string[]> = {};
        for (const n of nodes) {
          dependencies[n.nodeKey] = edges
            .filter((e) => e.toNodeKey === n.nodeKey)
            .map((e) => e.fromNodeKey);
        }

        // Loop until all nodes are executed
        while (finishedNodes.size < nodes.length) {
          // Find nodes that are ready to run:
          // Dependencies all in finishedNodes, not already running or finished
          const readyToRun = nodes.filter(
            (n) =>
              !runningNodes.has(n.nodeKey) &&
              !finishedNodes.has(n.nodeKey) &&
              dependencies[n.nodeKey].every((dep) => finishedNodes.has(dep))
          );

          if (readyToRun.length === 0 && runningNodes.size === 0) {
            // Deadlock or circular dependency
            break;
          }

          if (readyToRun.length > 0) {
            // Run all ready nodes in PARALLEL
            const promises = readyToRun.map(async (readyNode) => {
              runningNodes.add(readyNode.nodeKey);

              // Update DB & notify client
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

              // Gather context from this node's direct parents
              const parentContext: Record<string, string> = {};
              for (const parentKey of dependencies[readyNode.nodeKey]) {
                if (completedOutputs[parentKey]) {
                  parentContext[parentKey] = completedOutputs[parentKey];
                }
              }

              // Execute AI node
              try {
                const res = await executeNode(
                  readyNode,
                  parentContext,
                  apiKeys
                );

                // Update DB with output
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
                finishedNodes.add(readyNode.nodeKey);
                runningNodes.delete(readyNode.nodeKey);

                sendEvent("node_update", {
                  nodeKey: readyNode.nodeKey,
                  status: "COMPLETED",
                  title: readyNode.title,
                  assignedAi: readyNode.assignedAi,
                  output: res.output,
                  latencyMs: res.latencyMs,
                });
              } catch (nodeErr) {
                console.error(`Node ${readyNode.nodeKey} error:`, nodeErr);
                await prisma.taskNode.update({
                  where: { id: readyNode.id },
                  data: { status: "FAILED" },
                });
                finishedNodes.add(readyNode.nodeKey);
                runningNodes.delete(readyNode.nodeKey);

                sendEvent("node_update", {
                  nodeKey: readyNode.nodeKey,
                  status: "FAILED",
                  title: readyNode.title,
                  error: "Thực thi thất bại",
                });
              }
            });

            await Promise.all(promises);
          } else {
            // Wait brief moment for currently running nodes to complete
            await new Promise((res) => setTimeout(res, 200));
          }
        }

        // 3. Synthesis Phase
        sendEvent("synthesis_start", {
          message: "Tất cả các AI đã hoàn thành nhiệm vụ! Đang tổng hợp thành sản phẩm hoàn chỉnh...",
        });

        const nodeResults = nodes.map((n) => ({
          nodeKey: n.nodeKey,
          title: n.title,
          assignedAi: n.assignedAi,
          output: completedOutputs[n.nodeKey] || "Không có kết quả",
        }));

        const artifactContent = await synthesizeOutputs(
          task.prompt,
          nodeResults,
          apiKeys
        );

        // Save Artifact in DB
        const savedArtifact = await prisma.artifact.upsert({
          where: { taskId },
          create: {
            taskId,
            type: "MARKDOWN",
            content: artifactContent,
          },
          update: {
            content: artifactContent,
          },
        });

        // Mark task as COMPLETED
        await prisma.task.update({
          where: { id: taskId },
          data: { status: "COMPLETED" },
        });

        sendEvent("artifact_completed", {
          artifact: savedArtifact,
          status: "COMPLETED",
        });

        sendEvent("done", { taskId });
      } catch (err) {
        console.error("Execution loop failed:", err);
        sendEvent("error", {
          message: "Lỗi trong quá trình điều phối thực thi DAG",
        });
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
