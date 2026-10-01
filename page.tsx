"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { DagCanvas } from "@/components/DagCanvas";
import { ArtifactHub } from "@/components/ArtifactHub";
import { ModelSwitcherModal } from "@/components/ModelSwitcherModal";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { AiTrendRadarModal } from "@/components/AiTrendRadarModal";
import { WorkflowPresetsModal } from "@/components/WorkflowPresetsModal";
import { LiveConsole, LogEntry } from "@/components/LiveConsole";
import { ApiKeyConfig, ModelId } from "@/lib/types";
import { MODELS_REGISTRY } from "@/lib/models-registry";
import { WorkflowPreset } from "@/lib/workflow-presets";
import {
  Cpu,
  FileText,
  Columns,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Compass,
} from "lucide-react";

interface TaskSummary {
  id: string;
  prompt: string;
  status: string;
  createdAt: string;
  nodes: unknown[];
}

interface FullTask {
  id: string;
  prompt: string;
  status: string;
  autoExecute: boolean;
  nodes: Array<{
    id: string;
    nodeKey: string;
    title: string;
    description: string;
    assignedAi: string;
    status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
    promptInput?: string | null;
    rawOutput?: string | null;
    latencyMs?: number | null;
    tokensUsed?: number | null;
  }>;
  edges: Array<{
    id: string;
    fromNodeKey: string;
    toNodeKey: string;
  }>;
  finalArtifact: {
    id: string;
    type: string;
    content: string;
  } | null;
}

export default function WorkspacePage() {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [activeTask, setActiveTask] = useState<FullTask | null>(null);
  const [isDecomposing, setIsDecomposing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // Workspace View Mode: "split" (both) | "canvas" (DAG only) | "artifact" (Output only)
  const [viewMode, setViewMode] = useState<"split" | "canvas" | "artifact">("split");

  // Modals state
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [isRadarModalOpen, setIsRadarModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [selectedNodeKeyForModal, setSelectedNodeKeyForModal] = useState<string | null>(null);
  const [activeInspectNodeKey, setActiveInspectNodeKey] = useState<string | null>(null);

  // BYOK Api keys in client memory
  const [apiKeys, setApiKeys] = useState<ApiKeyConfig>({});

  const addLog = useCallback(
    (source: string, message: string, type: "info" | "success" | "warning" | "error" = "info") => {
      const time = new Date().toLocaleTimeString("vi-VN", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
      setLogs((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: time,
          source,
          message,
          type,
        },
      ]);
    },
    []
  );

  // 1. Fetch initial tasks and load keys from localStorage
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
        if (data.tasks.length > 0 && !activeTask) {
          loadTaskDetails(data.tasks[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load tasks:", e);
    }
  }, [activeTask]);

  useEffect(() => {
    fetchTasks();
    try {
      const stored = localStorage.getItem("orchestrai_api_keys");
      if (stored) {
        setApiKeys(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [fetchTasks]);

  // 2. Load single task details
  const loadTaskDetails = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (data.task) {
        setActiveTask(data.task);
      }
    } catch (e) {
      console.error("Failed to load task details:", e);
    }
  };

  // 3. Create new task (triggers decomposition)
  const handleCreateTask = async (prompt: string, autoExecute: boolean, presetId?: string) => {
    setIsDecomposing(true);
    addLog("PLANNER", `Bắt đầu phân tích & phân rã mục tiêu: "${prompt}"...`, "info");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, autoExecute, apiKeys, presetId }),
      });
      const data = await res.json();
      if (data.task) {
        setActiveTask(data.task);
        await fetchTasks();
        setViewMode("split"); // default to balanced view
        addLog(
          "ORCHESTRATOR",
          `Thiết lập thành công sơ đồ luồng gồm ${data.task.nodes.length} bước với ${data.task.edges.length} liên kết phụ thuộc.`,
          "success"
        );

        if (autoExecute) {
          handleExecuteDag(data.task.id);
        }
      }
    } catch (e) {
      console.error("Create task failed:", e);
      addLog("ERROR", "Phân rã nhiệm vụ thất bại", "error");
    } finally {
      setIsDecomposing(false);
    }
  };

  // Apply a preset workflow template
  const handleSelectPreset = async (preset: WorkflowPreset) => {
    setIsDecomposing(true);
    addLog("PRESET", `Đang kích hoạt Mẫu Sơ Đồ: "${preset.name}" (${preset.complexityLabel})...`, "info");
    try {
      const targetPrompt = activeTask?.prompt || preset.defaultPrompt;
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: targetPrompt,
          presetId: preset.id,
          autoExecute: false,
          apiKeys,
        }),
      });
      const data = await res.json();
      if (data.task) {
        setActiveTask(data.task);
        await fetchTasks();
        setViewMode("canvas");
        addLog(
          "PRESET",
          `Đã cấu hình thành công Mẫu Sơ Đồ "${preset.name}" gồm ${data.task.nodes.length} bước chuyên trách!`,
          "success"
        );
      }
    } catch (e) {
      console.error("Apply preset error:", e);
      addLog("ERROR", "Không thể áp dụng mẫu sơ đồ", "error");
    } finally {
      setIsDecomposing(false);
    }
  };

  // 4. Delete task
  const handleDeleteTask = async (taskId: string) => {
    try {
      await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (activeTask?.id === taskId) {
        setActiveTask(null);
      }
      addLog("SYSTEM", `Đã xóa nhiệm vụ ${taskId}`, "info");
    } catch (e) {
      console.error("Failed to delete task:", e);
    }
  };

  // 5. Update a node (change model or tweak prompt)
  const handleSaveNodeCustomization = async (
    nodeKey: string,
    newModel: ModelId,
    newPrompt: string
  ) => {
    if (!activeTask) return;
    try {
      const res = await fetch(`/api/tasks/${activeTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeKey,
          assignedAi: newModel,
          promptInput: newPrompt,
        }),
      });
      const data = await res.json();
      if (data.node) {
        const meta = MODELS_REGISTRY[newModel];
        addLog(
          "CONFIG",
          `Đã chuyển giao bước [${nodeKey}] cho ${meta.name} (${meta.provider})`,
          "info"
        );

        setActiveTask({
          ...activeTask,
          nodes: activeTask.nodes.map((n) =>
            n.nodeKey === nodeKey
              ? { ...n, assignedAi: newModel, promptInput: newPrompt }
              : n
          ),
        });
      }
    } catch (e) {
      console.error("Failed to update node:", e);
    }
  };

  // 6. Apply Trending Roster (Student Free or Top Pro)
  const handleApplyRoster = async (mode: "student_free" | "top_trending") => {
    if (!activeTask) return;

    addLog(
      "RADAR",
      mode === "student_free"
        ? "Đang tự động chuyển đổi các bước sang Đội hình Sinh viên 100% Free Tier..."
        : "Đang tự động chuyển đổi sang Đội hình Dẫn đầu Benchmark Toàn cầu...",
      "info"
    );

    const updatedNodes = activeTask.nodes.map((node) => {
      let targetModel: ModelId;
      const combinedText = (node.title + " " + node.description).toLowerCase();

      if (mode === "student_free") {
        if (combinedText.includes("code") || combinedText.includes("lập trình") || combinedText.includes("mã nguồn")) {
          targetModel = "qwen-2.5-coder-32b";
        } else if (
          combinedText.includes("phản biện") ||
          combinedText.includes("qa") ||
          combinedText.includes("thẩm định") ||
          combinedText.includes("kiểm tra")
        ) {
          targetModel = "llama-3-3-70b";
        } else if (combinedText.includes("toán") || combinedText.includes("logic")) {
          targetModel = "deepseek-v4-1-flash";
        } else {
          targetModel = "gemini-3-8-flash";
        }
      } else {
        if (combinedText.includes("code") || combinedText.includes("lập trình")) {
          targetModel = "claude-opus-5-5";
        } else if (
          combinedText.includes("tài liệu") ||
          combinedText.includes("nghiên cứu") ||
          combinedText.includes("bối cảnh")
        ) {
          targetModel = "gemini-3-8-live";
        } else if (
          combinedText.includes("qa") ||
          combinedText.includes("kiểm tra") ||
          combinedText.includes("thẩm định")
        ) {
          targetModel = "gpt-6-sol";
        } else {
          targetModel = "gpt-6-astra";
        }
      }

      fetch(`/api/tasks/${activeTask.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeKey: node.nodeKey,
          assignedAi: targetModel,
        }),
      }).catch(console.error);

      return { ...node, assignedAi: targetModel };
    });

    setActiveTask({ ...activeTask, nodes: updatedNodes });
    addLog(
      "RADAR",
      mode === "student_free"
        ? "Đã kích hoạt thành công Đội hình Sinh viên 2026 (Gemini 3.8 Flash + Qwen 2.5 Coder + Llama 3.3 70B + DeepSeek V4.1: Chi phí 0đ)!"
        : "Đã kích hoạt thành công Đội hình Frontier 2026 (Claude Opus 5.5 + Gemini 3.8 Live + GPT-6 Astra/Sol)!",
      "success"
    );
  };

  // 7. Execute DAG (SSE Streaming)
  const handleExecuteDag = async (overrideTaskId?: string) => {
    const targetTaskId = overrideTaskId || activeTask?.id;
    if (!targetTaskId || isExecuting) return;

    setIsExecuting(true);
    addLog("ORCHESTRATOR", "Khởi động động cơ điều phối DAG (DAG Execution Engine)...", "info");

    try {
      const response = await fetch(`/api/tasks/${targetTaskId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKeys }),
      });

      if (!response.body) {
        throw new Error("No response body stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() || "";

        for (const block of lines) {
          if (!block.trim()) continue;

          let eventName = "message";
          let dataStr = "";

          const blockLines = block.split("\n");
          for (const line of blockLines) {
            if (line.startsWith("event: ")) {
              eventName = line.substring(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.substring(6).trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventName === "task_status") {
              setActiveTask((prev) => (prev ? { ...prev, status: data.status } : null));
            } else if (eventName === "node_update") {
              setActiveTask((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  nodes: prev.nodes.map((n) =>
                    n.nodeKey === data.nodeKey
                      ? {
                          ...n,
                          status: data.status,
                          rawOutput: data.output || n.rawOutput,
                          latencyMs: data.latencyMs || n.latencyMs,
                        }
                      : n
                  ),
                };
              });

              const modelMeta = MODELS_REGISTRY[data.assignedAi as ModelId] || MODELS_REGISTRY["gemini-3-8-flash"] || MODELS_REGISTRY["gpt-4o"];
              if (data.status === "RUNNING") {
                addLog(modelMeta.name, `Đang xử lý bước "${data.title}"...`, "info");
              } else if (data.status === "COMPLETED") {
                addLog(
                  modelMeta.name,
                  `Đã hoàn thành bước "${data.title}" trong ${(data.latencyMs / 1000).toFixed(1)}s!`,
                  "success"
                );
              }
            } else if (eventName === "synthesis_start") {
              addLog("SYNTHESIZER", data.message, "info");
            } else if (eventName === "artifact_completed") {
              setActiveTask((prev) =>
                prev
                  ? {
                      ...prev,
                      status: "COMPLETED",
                      finalArtifact: data.artifact,
                    }
                  : null
              );
              addLog("SYNTHESIZER", "Đã tạo thành công sản phẩm hoàn chỉnh (Unified Artifact)!", "success");

              // If currently in pure canvas view, open split or artifact so user instantly sees output
              setViewMode("split");
            } else if (eventName === "done") {
              addLog("ORCHESTRATOR", "Toàn bộ quy trình đã kết thúc thành công!", "success");
              fetchTasks();
            }
          } catch (jsonErr) {
            console.warn("SSE json parse error:", jsonErr);
          }
        }
      }
    } catch (execErr) {
      console.error("Execution error:", execErr);
      addLog("ERROR", "Có lỗi xảy ra trong quá trình thực thi DAG", "error");
    } finally {
      setIsExecuting(false);
    }
  };

  // 8. Execute Co-Pilot Refine Command via Dynamic Workflow SSE
  const handleExecuteRefineCommand = async (instruction: string) => {
    if (!activeTask || isExecuting) return;

    setIsExecuting(true);
    addLog(
      "CO-PILOT",
      `⚡ Nhận lệnh điều hành trực tiếp từ thanh chat phụ: "${instruction}"`,
      "warning"
    );
    addLog(
      "WORKFLOW",
      "Đang kích hoạt Chuỗi Điều Phối Can Thiệp Đa AI (Kiến trúc -> Lập trình -> Thẩm định)...",
      "info"
    );

    try {
      const response = await fetch(`/api/tasks/${activeTask.id}/refine`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instruction, apiKeys }),
      });

      if (!response.body) {
        throw new Error("No response body stream");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split("\n\n");
        buffer = blocks.pop() || "";

        for (const block of blocks) {
          if (!block.trim()) continue;

          let eventName = "message";
          let dataStr = "";

          const lines = block.split("\n");
          for (const line of lines) {
            if (line.startsWith("event: ")) {
              eventName = line.substring(7).trim();
            } else if (line.startsWith("data: ")) {
              dataStr = line.substring(6).trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);

            if (eventName === "nodes_added") {
              // Add new iteration nodes & edges to activeTask
              setActiveTask((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  nodes: [...prev.nodes, ...data.newNodes],
                  edges: [...prev.edges, ...data.newEdges],
                };
              });
              addLog(
                "WORKFLOW",
                `Đã gắn thành công ${data.newNodes.length} bước can thiệp mới vào sơ đồ luồng DAG!`,
                "success"
              );
            } else if (eventName === "node_update") {
              setActiveTask((prev) => {
                if (!prev) return null;
                return {
                  ...prev,
                  nodes: prev.nodes.map((n) =>
                    n.nodeKey === data.nodeKey
                      ? {
                          ...n,
                          status: data.status,
                          rawOutput: data.output || n.rawOutput,
                          latencyMs: data.latencyMs || n.latencyMs,
                        }
                      : n
                  ),
                };
              });

              const modelMeta =
                MODELS_REGISTRY[data.assignedAi as ModelId] ||
                MODELS_REGISTRY["gemini-3-8-flash"];

              if (data.status === "RUNNING") {
                addLog(modelMeta.name, `[Lệnh Điều Hành] Đang thực thi: "${data.title}"...`, "info");
              } else if (data.status === "COMPLETED") {
                addLog(
                  modelMeta.name,
                  `[Lệnh Điều Hành] Hoàn tất: "${data.title}" (${((data.latencyMs || 1000) / 1000).toFixed(1)}s)`,
                  "success"
                );
              }
            } else if (eventName === "synthesis_start") {
              addLog("SYNTHESIZER", data.message, "info");
            } else if (eventName === "artifact_completed") {
              setActiveTask((prev) =>
                prev
                  ? {
                      ...prev,
                      finalArtifact: data.artifact,
                    }
                  : null
              );
              addLog(
                "ORCHESTRATOR",
                `Đã tích hợp thành công tính năng mới vào toàn bộ mã nguồn sản phẩm!`,
                "success"
              );
              await fetchTasks();
            } else if (eventName === "refine_completed") {
              addLog("CO-PILOT", data.message, "success");
            }
          } catch (jsonErr) {
            console.warn("Refine SSE json parse error:", jsonErr);
          }
        }
      }
    } catch (refineErr) {
      console.error("Refine command execution error:", refineErr);
      addLog("ERROR", "Thực thi lệnh điều hành dự án thất bại", "error");
    } finally {
      setIsExecuting(false);
    }
  };

  const selectedNode = activeTask?.nodes.find(
    (n) => n.nodeKey === selectedNodeKeyForModal
  ) || null;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#06110d] font-sans text-emerald-100">
      {/* 1. Left Column: Sidebar */}
      <Sidebar
        tasks={tasks}
        activeTaskId={activeTask?.id || null}
        onSelectTask={(id) => loadTaskDetails(id)}
        onCreateTask={handleCreateTask}
        onDeleteTask={handleDeleteTask}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onOpenRadarModal={() => setIsRadarModalOpen(true)}
        onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
        isDecomposing={isDecomposing}
      />

      {/* 2. Middle & Right Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Control Bar: View Switcher & Action Shortcuts */}
        <div className="h-13 border-b border-[#133326] bg-[#0b1a14]/90 backdrop-blur-md px-6 flex items-center justify-between z-10 shrink-0">
          {/* Active Task Title */}
          <div className="flex items-center gap-3 overflow-hidden max-w-md">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
            <h2 className="text-xs font-bold text-white truncate" title={activeTask?.prompt || "Chưa chọn nhiệm vụ"}>
              {activeTask?.prompt || "OrchestrAI Multi-Model Workspace"}
            </h2>
            {activeTask?.status === "COMPLETED" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                Đã có sản phẩm
              </span>
            )}
          </div>

          {/* Central View Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#06110d] border border-[#133326] rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode("canvas")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "canvas"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Sơ đồ Luồng AI</span>
            </button>

            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "split"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Chia đôi (Split View)</span>
            </button>

            <button
              onClick={() => setViewMode("artifact")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                viewMode === "artifact"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Sản phẩm Hoàn chỉnh</span>
              {activeTask?.finalArtifact && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPresetsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06110d] hover:bg-emerald-950/40 text-emerald-300 border border-[#133326] hover:border-emerald-700/60 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mẫu Sơ Đồ</span>
            </button>
          </div>
        </div>

        {/* Global Output Ready Banner (When Completed) */}
        {activeTask?.status === "COMPLETED" && activeTask.finalArtifact && viewMode === "canvas" && (
          <div className="bg-gradient-to-r from-emerald-950 via-[#0b1a14] to-teal-950 border-b border-emerald-500/50 px-6 py-2 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold text-emerald-300">
                🎉 Sản phẩm hoàn chỉnh đã sẵn sàng! Đã tổng hợp thành công từ các mô hình AI.
              </span>
            </div>
            <button
              onClick={() => setViewMode("artifact")}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition shadow-md shadow-emerald-900/50 cursor-pointer"
            >
              <span>Xem Sản Phẩm Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Main Workspace Body based on ViewMode */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Section A: DAG Canvas (Rendered when viewMode is "canvas" or "split") */}
          {(viewMode === "canvas" || viewMode === "split") && (
            <div className={`flex flex-col h-full overflow-hidden ${viewMode === "split" ? "flex-1 border-r border-[#133326]" : "w-full"}`}>
              <div className="flex-1 relative">
                <DagCanvas
                  nodesData={activeTask?.nodes || []}
                  edgesData={activeTask?.edges || []}
                  taskStatus={activeTask?.status || "READY"}
                  autoExecute={activeTask?.autoExecute || false}
                  hasArtifact={Boolean(activeTask?.finalArtifact)}
                  onToggleAutoExecute={(val) => {
                    if (activeTask) {
                      setActiveTask({ ...activeTask, autoExecute: val });
                    }
                  }}
                  onExecuteDag={() => handleExecuteDag()}
                  onOpenModelModal={(nodeKey) => {
                    setSelectedNodeKeyForModal(nodeKey);
                    setIsModelModalOpen(true);
                  }}
                  onInspectOutput={(nodeKey) => {
                    setActiveInspectNodeKey(nodeKey);
                    if (viewMode === "canvas") {
                      setViewMode("split");
                    }
                  }}
                  onReplan={() => {
                    if (activeTask) {
                      handleCreateTask(activeTask.prompt, activeTask.autoExecute);
                    }
                  }}
                  onOpenPresetsModal={() => setIsPresetsModalOpen(true)}
                  onViewArtifact={() => setViewMode("artifact")}
                />
              </div>

              {/* Collapsible Console Drawer */}
              <LiveConsole logs={logs} />
            </div>
          )}

          {/* Section B: Artifact Hub (Rendered when viewMode is "artifact" or "split") */}
          {(viewMode === "artifact" || viewMode === "split") && (
            <div className={`h-full overflow-hidden ${viewMode === "artifact" ? "w-full" : "w-[480px] xl:w-[560px]"}`}>
              <ArtifactHub
                taskId={activeTask?.id}
                taskGoal={activeTask?.prompt}
                artifact={activeTask?.finalArtifact || null}
                nodes={activeTask?.nodes || []}
                isExecuting={isExecuting}
                activeInspectNodeKey={activeInspectNodeKey}
                onClearInspect={() => setActiveInspectNodeKey(null)}
                onBackToCanvas={viewMode === "artifact" ? () => setViewMode("canvas") : undefined}
                onArtifactUpdated={(newContent) => {
                  if (activeTask) {
                    setActiveTask({
                      ...activeTask,
                      finalArtifact: activeTask.finalArtifact
                        ? { ...activeTask.finalArtifact, content: newContent }
                        : { id: "art_" + Date.now(), type: "MARKDOWN", content: newContent },
                    });
                    addLog("CO-PILOT", "Đã cập nhật mã nguồn dự án thành công!", "success");
                  }
                }}
                apiKeys={apiKeys}
                onExecuteRefineCommand={handleExecuteRefineCommand}
              />
            </div>
          )}
        </div>
      </div>

      {/* Model Switcher & Pros/Cons Modal */}
      <ModelSwitcherModal
        isOpen={isModelModalOpen}
        onClose={() => {
          setIsModelModalOpen(false);
          setSelectedNodeKeyForModal(null);
        }}
        currentNode={selectedNode}
        onSave={handleSaveNodeCustomization}
      />

      {/* BYOK API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        onSaveKeys={(newKeys) => {
          setApiKeys(newKeys);
          addLog("SETTINGS", "Đã cập nhật cấu hình khóa API (BYOK)", "success");
        }}
      />

      {/* Global AI Trend Radar Modal */}
      <AiTrendRadarModal
        isOpen={isRadarModalOpen}
        onClose={() => setIsRadarModalOpen(false)}
        onApplyRoster={handleApplyRoster}
      />

      {/* Workflow Presets Modal */}
      <WorkflowPresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
