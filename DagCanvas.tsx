"use client";

import React, { useMemo, useCallback } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from "@xyflow/react";
import { CustomTaskNode, TaskNodeData } from "./CustomTaskNode";
import {
  Play,
  Loader2,
  Sparkles,
  CheckCircle,
  RefreshCw,
  Layers,
  ArrowRight,
  FileText,
} from "lucide-react";

interface DagCanvasProps {
  nodesData: Array<{
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
  edgesData: Array<{
    id: string;
    fromNodeKey: string;
    toNodeKey: string;
  }>;
  taskStatus: string;
  autoExecute: boolean;
  hasArtifact?: boolean;
  onToggleAutoExecute: (val: boolean) => void;
  onExecuteDag: () => void;
  onOpenModelModal: (nodeKey: string) => void;
  onInspectOutput: (nodeKey: string) => void;
  onReplan: () => void;
  onOpenPresetsModal?: () => void;
  onViewArtifact?: () => void;
}

const nodeTypes = {
  taskNode: CustomTaskNode,
};

export function DagCanvas({
  nodesData,
  edgesData,
  taskStatus,
  autoExecute,
  hasArtifact,
  onToggleAutoExecute,
  onExecuteDag,
  onOpenModelModal,
  onInspectOutput,
  onReplan,
  onOpenPresetsModal,
  onViewArtifact,
}: DagCanvasProps) {
  // Compute positions using topological tiering (hierarchical DAG layout)
  const { nodes, edges } = useMemo(() => {
    // 1. Calculate in-degrees
    const inDegree: Record<string, number> = {};
    const adj: Record<string, string[]> = {};
    nodesData.forEach((n) => {
      inDegree[n.nodeKey] = 0;
      adj[n.nodeKey] = [];
    });

    edgesData.forEach((e) => {
      if (inDegree[e.toNodeKey] !== undefined) {
        inDegree[e.toNodeKey] += 1;
      }
      if (adj[e.fromNodeKey]) {
        adj[e.fromNodeKey].push(e.toNodeKey);
      }
    });

    // 2. Assign levels (Y coordinates)
    const levels: Record<string, number> = {};
    const queue = nodesData
      .filter((n) => inDegree[n.nodeKey] === 0)
      .map((n) => n.nodeKey);

    queue.forEach((k) => (levels[k] = 0));

    let head = 0;
    while (head < queue.length) {
      const u = queue[head++];
      const currentLevel = levels[u] || 0;
      (adj[u] || []).forEach((v) => {
        levels[v] = Math.max(levels[v] || 0, currentLevel + 1);
        queue.push(v);
      });
    }

    // 3. Group by level for X positioning
    const levelGroups: Record<number, string[]> = {};
    nodesData.forEach((n) => {
      const lvl = levels[n.nodeKey] ?? 0;
      if (!levelGroups[lvl]) levelGroups[lvl] = [];
      levelGroups[lvl].push(n.nodeKey);
    });

    // 4. Build React Flow Nodes
    const flowNodes: Node[] = nodesData.map((n) => {
      const lvl = levels[n.nodeKey] ?? 0;
      const group = levelGroups[lvl] || [n.nodeKey];
      const indexInGroup = group.indexOf(n.nodeKey);
      const totalInGroup = group.length;

      // Center nodes horizontally per tier with generous spacing to avoid overlap
      const spacingX = 360;
      const spacingY = 290;
      const startX = -((totalInGroup - 1) * spacingX) / 2 + 350;
      const x = startX + indexInGroup * spacingX;
      const y = 60 + lvl * spacingY;

      return {
        id: n.nodeKey,
        type: "taskNode",
        position: { x, y },
        data: {
          ...n,
          onOpenModelModal,
          onInspectOutput,
        } as TaskNodeData,
      };
    });

    // 5. Build React Flow Edges (Emerald themed)
    const flowEdges: Edge[] = edgesData.map((e) => ({
      id: `edge-${e.fromNodeKey}-${e.toNodeKey}`,
      source: e.fromNodeKey,
      target: e.toNodeKey,
      type: "smoothstep",
      animated: taskStatus === "RUNNING",
      style: {
        stroke: taskStatus === "RUNNING" ? "#34d399" : "#10b981",
        strokeWidth: 2.5,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: taskStatus === "RUNNING" ? "#34d399" : "#10b981",
      },
    }));

    return { nodes: flowNodes, edges: flowEdges };
  }, [nodesData, edgesData, taskStatus, onOpenModelModal, onInspectOutput]);

  const isExecuting = taskStatus === "RUNNING";
  const isCompleted = taskStatus === "COMPLETED";

  return (
    <div className="relative w-full h-full bg-[#06110d] flex flex-col overflow-hidden">
      {/* Top Action Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
        {/* Left: Workflow Status Indicator & Preset button */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-[#0b1a14]/90 backdrop-blur-md border border-[#133326] px-3.5 py-2 rounded-2xl shadow-xl">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-100">
              Sơ đồ luồng AI (DAG)
            </span>
          </div>
          <div className="h-4 w-px bg-[#133326]" />
          <span className="text-xs text-emerald-400/80 font-mono">
            {nodesData.length} bước chuyên trách
          </span>

          {onOpenPresetsModal && (
            <>
              <div className="h-4 w-px bg-[#133326]" />
              <button
                onClick={onOpenPresetsModal}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 rounded-xl text-[11px] font-semibold transition cursor-pointer"
                title="Chọn mẫu sơ đồ AI từ nhẹ đến nặng"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Mẫu Quy Trình</span>
              </button>
            </>
          )}
        </div>

        {/* Right: Controls & Execute CTA */}
        <div className="pointer-events-auto flex items-center gap-2.5 bg-[#0b1a14]/90 backdrop-blur-md border border-[#133326] px-3.5 py-2 rounded-2xl shadow-xl">
          {/* View Artifact Quick Button if ready */}
          {hasArtifact && onViewArtifact && (
            <button
              onClick={onViewArtifact}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
              title="Xem sản phẩm hoàn chỉnh"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Xem Sản Phẩm</span>
            </button>
          )}

          {/* Auto-execute Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoExecute}
              onChange={(e) => onToggleAutoExecute(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-8 h-4.5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-600 relative"></div>
            <span className="text-xs font-medium text-slate-300">
              Tự động chạy
            </span>
          </label>

          <div className="h-4 w-px bg-[#133326]" />

          {/* Replan Button */}
          <button
            onClick={onReplan}
            disabled={isExecuting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-emerald-950/40 transition disabled:opacity-50 cursor-pointer"
            title="Tái phân rã nhiệm vụ"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Phân rã lại</span>
          </button>

          {/* Execute Button */}
          <button
            onClick={onExecuteDag}
            disabled={isExecuting}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white transition shadow-lg cursor-pointer ${
              isExecuting
                ? "bg-slate-700 cursor-not-allowed opacity-80"
                : isCompleted
                ? "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/60"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-950/60"
            }`}
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang điều phối các AI...</span>
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span>Chạy lại quy trình</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current text-white" />
                <span>Kích hoạt thực thi DAG</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Prominent Floating Banner when Output / Artifact is READY */}
      {hasArtifact && onViewArtifact && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-xl bg-gradient-to-r from-emerald-950/95 via-[#0b1a14]/95 to-teal-950/95 border-2 border-emerald-500/80 p-4 rounded-2xl shadow-2xl shadow-emerald-950/90 backdrop-blur-xl flex items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>🎉 Sản phẩm Hoàn chỉnh đã sẵn sàng!</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Unified Artifact
                </span>
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Các AI đã hoàn tất và kết quả đã được tổng hợp xong. Bấm để xem kết quả chi tiết.
              </p>
            </div>
          </div>
          <button
            onClick={onViewArtifact}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/50 shrink-0 cursor-pointer"
          >
            <span>Xem Kết Quả Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* React Flow Viewport */}
      <div className="flex-1 w-full h-full">
        {nodesData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
            <Sparkles className="w-10 h-10 text-emerald-600" />
            <p className="text-sm font-semibold text-slate-300">Chưa có nhiệm vụ nào được tạo.</p>
            <p className="text-xs text-slate-400 max-w-sm text-center leading-relaxed">
              Nhập mục tiêu ở cột bên trái hoặc chọn một &ldquo;Mẫu Quy Trình (Presets)&rdquo; để AI thiết lập luồng tự động.
            </p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            minZoom={0.2}
            maxZoom={1.5}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1.5}
              color="#133326"
            />
            <Controls className="!bg-[#0b1a14] !border-[#133326] !fill-emerald-400 !text-emerald-400" />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}
