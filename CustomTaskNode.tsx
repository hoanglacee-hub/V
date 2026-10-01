"use client";

import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { MODELS_REGISTRY } from "@/lib/models-registry";
import { ModelId } from "@/lib/types";
import {
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  SlidersHorizontal,
  ExternalLink,
} from "lucide-react";

export interface TaskNodeData {
  [key: string]: unknown;
  nodeKey: string;
  title: string;
  description: string;
  assignedAi: string;
  status: "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
  promptInput?: string | null;
  rawOutput?: string | null;
  latencyMs?: number | null;
  tokensUsed?: number | null;
  onOpenModelModal?: (nodeKey: string) => void;
  onInspectOutput?: (nodeKey: string) => void;
}

export const CustomTaskNode = memo(function CustomTaskNode({
  data,
}: {
  data: TaskNodeData;
}) {
  const meta =
    MODELS_REGISTRY[data.assignedAi as ModelId] || MODELS_REGISTRY["gemini-3-8-flash"] || MODELS_REGISTRY["gpt-4o"];

  const getStatusBadge = () => {
    switch (data.status) {
      case "RUNNING":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-300 bg-teal-500/15 border border-teal-500/40 px-2 py-0.5 rounded-full animate-pulse shadow-sm shadow-teal-500/20">
            <Loader2 className="w-3 h-3 animate-spin" />
            Đang xử lý...
          </span>
        );
      case "COMPLETED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 rounded-full shadow-sm shadow-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Hoàn thành
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3 h-3" />
            Lỗi
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400 bg-slate-800/60 border border-slate-700/60 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />
            Chờ thực thi
          </span>
        );
    }
  };

  const getBorderColor = () => {
    if (data.status === "RUNNING") return "border-teal-500 shadow-xl shadow-teal-500/20 ring-1 ring-teal-500/40";
    if (data.status === "COMPLETED") return "border-emerald-500/80 shadow-lg shadow-emerald-500/15";
    if (data.status === "FAILED") return "border-rose-500/80";
    return "border-emerald-950/80 hover:border-emerald-700/60";
  };

  return (
    <div
      className={`w-72 bg-slate-900/95 backdrop-blur-md rounded-2xl border ${getBorderColor()} shadow-2xl transition-all duration-300 overflow-hidden group`}
    >
      {/* React Flow Top Handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-slate-950 shadow-sm shadow-emerald-500/50"
      />

      {/* Node Header */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-lg bg-gradient-to-br ${meta.avatarColor} flex items-center justify-center text-white shadow-sm`}
          >
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">{meta.name}</span>
              {meta.tier === "free" && (
                <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  0đ Free
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">{meta.provider}</span>
          </div>
        </div>

        {getStatusBadge()}
      </div>

      {/* Node Content */}
      <div className="p-3.5 space-y-2">
        <h4 className="text-xs font-bold text-slate-100 line-clamp-1">
          {data.title}
        </h4>
        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
          {data.description}
        </p>

        {/* Latency & Stats if done */}
        {data.latencyMs && (
          <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
            <span className="text-emerald-400/80 font-mono">Thời gian: {(data.latencyMs / 1000).toFixed(1)}s</span>
            {data.tokensUsed ? <span>{data.tokensUsed} tokens</span> : null}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="px-3.5 py-2.5 bg-slate-950/80 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <button
          onClick={() => data.onOpenModelModal?.(data.nodeKey)}
          className="flex items-center gap-1.5 text-[11px] text-emerald-400 hover:text-emerald-300 font-medium transition cursor-pointer"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Đổi AI / Tùy biến</span>
        </button>

        {data.rawOutput && (
          <button
            onClick={() => data.onInspectOutput?.(data.nodeKey)}
            className="flex items-center gap-1 text-[11px] font-bold text-emerald-300 hover:text-emerald-200 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 px-2 py-0.5 rounded transition cursor-pointer shadow-sm"
          >
            <span>Xem output</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* React Flow Bottom Handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-emerald-500 !border-2 !border-slate-950 shadow-sm shadow-emerald-500/50"
      />
    </div>
  );
});
