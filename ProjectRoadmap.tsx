"use client";

import React from "react";
import {
  CheckCircle2,
  Clock,
  Code2,
  FileCode2,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { MODELS_REGISTRY } from "@/lib/models-registry";
import { ModelId } from "@/lib/types";

interface ProjectRoadmapProps {
  nodes: Array<{
    nodeKey: string;
    title: string;
    description: string;
    assignedAi: string;
    status: string;
    latencyMs?: number | null;
    tokensUsed?: number | null;
  }>;
  taskGoal: string;
  isCompleted: boolean;
}

export function ProjectRoadmap({ nodes, taskGoal, isCompleted }: ProjectRoadmapProps) {
  const completedCount = nodes.filter((n) => n.status === "COMPLETED").length;
  const progressPercent = nodes.length > 0 ? Math.round((completedCount / nodes.length) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Overview Progress Card */}
      <div className="p-5 bg-[#06110d] border border-[#133326] rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Tiến Độ Triển Khai Dự Án Thực Tế
            </span>
            <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-2">
              <span>{taskGoal}</span>
            </h3>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {progressPercent}%
            </span>
            <div className="text-[11px] text-slate-400">
              {completedCount}/{nodes.length} giai đoạn hoàn tất
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-[#133326]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs border-t border-[#133326]/60">
          <div className="p-2.5 rounded-xl bg-[#0b1a14] border border-[#133326]">
            <span className="text-[10px] text-slate-400 block">Sản phẩm đầu ra:</span>
            <span className="font-bold text-emerald-300">Bộ Code Hoàn Chỉnh</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b1a14] border border-[#133326]">
            <span className="text-[10px] text-slate-400 block">Trạng thái:</span>
            <span className="font-bold text-emerald-400">
              {isCompleted ? "Sẵn sàng chạy (Ready)" : "Đang thực thi"}
            </span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b1a14] border border-[#133326]">
            <span className="text-[10px] text-slate-400 block">Mô hình tham gia:</span>
            <span className="font-bold text-slate-200">{nodes.length} AI chuyên trách</span>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0b1a14] border border-[#133326]">
            <span className="text-[10px] text-slate-400 block">Chi phí vận hành:</span>
            <span className="font-bold text-emerald-400">0đ (100% Free Tiers)</span>
          </div>
        </div>
      </div>

      {/* Step-by-Step Phase Pipeline */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span>Sơ đồ tiến trình theo từng bước thực hiện:</span>
        </div>

        <div className="space-y-3">
          {nodes.map((node, index) => {
            const isDone = node.status === "COMPLETED";
            const isRunning = node.status === "RUNNING";
            const meta =
              MODELS_REGISTRY[node.assignedAi as ModelId] || MODELS_REGISTRY["gemini-3-8-flash"];

            return (
              <div
                key={node.nodeKey}
                className={`p-4 rounded-2xl border transition-all ${
                  isDone
                    ? "bg-[#06110d] border-emerald-500/60 shadow-lg shadow-emerald-950/40"
                    : isRunning
                    ? "bg-[#0b1a14] border-teal-500/80 shadow-lg shadow-teal-950/40 ring-1 ring-teal-500/50"
                    : "bg-[#06110d]/60 border-[#133326] text-slate-400"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Step Info */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        isDone
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : isRunning
                          ? "bg-teal-500/20 text-teal-400 border border-teal-500/40 animate-pulse"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {isDone ? <Check className="w-4 h-4" /> : index + 1}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Giai đoạn {index + 1}:
                        </span>
                        <h4 className="text-sm font-bold text-white">{node.title}</h4>
                      </div>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {node.description}
                      </p>

                      {/* Deliverables Produced in this Phase */}
                      <div className="flex items-center gap-2 mt-2.5">
                        <span className="text-[10px] font-semibold text-slate-400">
                          Sản phẩm bàn giao:
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0b1a14] text-emerald-300 border border-[#133326]">
                          {node.nodeKey.includes("arch")
                            ? "Kiến Trúc & Cấu Trúc Dữ Liệu (TypeScript)"
                            : node.nodeKey.includes("code")
                            ? "Mã Nguồn Chi Tiết & Tích Hợp Tính Năng"
                            : node.nodeKey.includes("qa")
                            ? "Thẩm Định Bảo Mật, Kiểm Thử & Tối Ưu"
                            : index === 0
                            ? "Kiến Trúc & Cấu Trúc Dữ Liệu (TypeScript)"
                            : index === 1
                            ? "Mã Nguồn Chi Tiết & Tích Hợp Tính Năng"
                            : "Thẩm Định Bảo Mật & Kiểm Thử"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Model attribution */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        meta?.badgeColor || "bg-slate-800 text-slate-300"
                      }`}
                    >
                      {meta?.name || node.assignedAi}
                    </span>
                    <div className="text-[10px] text-emerald-400/80 font-mono mt-1">
                      {isDone
                        ? `Hoàn tất (${((node.latencyMs || 1500) / 1000).toFixed(1)}s)`
                        : isRunning
                        ? "Đang xử lý..."
                        : "Chờ đến lượt"}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
