"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Key,
  Plus,
  Trash2,
  Cpu,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Clock,
  ChevronRight,
  Boxes,
  Compass,
  Globe,
  GraduationCap,
  Layers,
} from "lucide-react";

interface SidebarProps {
  tasks: Array<{
    id: string;
    prompt: string;
    status: string;
    createdAt: string;
    nodes: unknown[];
  }>;
  activeTaskId: string | null;
  onSelectTask: (taskId: string) => void;
  onCreateTask: (prompt: string, autoExecute: boolean) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onOpenKeyModal: () => void;
  onOpenRadarModal: () => void;
  onOpenPresetsModal: () => void;
  isDecomposing: boolean;
}

const EXAMPLE_PROMPTS = [
  "Xây dựng kế hoạch marketing và tạo mã nguồn landing page SaaS",
  "Nghiên cứu thị trường AI Agents 2026 & viết báo cáo đầu tư chuyên sâu",
  "Thiết kế kiến trúc hệ thống Microservices & đặc tả API Schema",
  "Tạo app phân loại đề thi theo mức độ khó và lọc các câu hỏi tự động",
];

export function Sidebar({
  tasks,
  activeTaskId,
  onSelectTask,
  onCreateTask,
  onDeleteTask,
  onOpenKeyModal,
  onOpenRadarModal,
  onOpenPresetsModal,
  isDecomposing,
}: SidebarProps) {
  const [prompt, setPrompt] = useState("");
  const [autoExecute, setAutoExecute] = useState(false);
  const [showNewTaskForm, setShowNewTaskForm] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isDecomposing) return;
    await onCreateTask(prompt.trim(), autoExecute);
    setPrompt("");
  };

  const handleUseExample = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="w-80 h-full flex flex-col bg-[#06110d] border-r border-[#133326] select-none">
      {/* App Branding */}
      <div className="p-4 border-b border-[#133326] flex items-center justify-between bg-[#0b1a14]/60">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-950/60">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              OrchestrAI
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                MoA
              </span>
            </h1>
            <p className="text-[11px] text-emerald-400/80">Workspace đa mô hình AI</p>
          </div>
        </div>

        <button
          onClick={onOpenKeyModal}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-950/40 transition cursor-pointer"
          title="Cài đặt khóa API (BYOK)"
        >
          <Key className="w-4 h-4 text-emerald-400" />
        </button>
      </div>

      {/* Main Content: Presets + Radar + New Task Form + History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {/* Quick Action 1: Workflow Presets */}
        <button
          onClick={onOpenPresetsModal}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0b1a14] to-slate-950 border border-emerald-700/50 hover:border-emerald-500 transition shadow-md shadow-emerald-950/40 group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition shadow-sm">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                  Mẫu Quy Trình (Presets)
                </span>
                <span className="text-[9px] font-bold px-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mới
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Từ nhẹ đến sâu (2-4 AI)
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-300 group-hover:translate-x-0.5 transition" />
        </button>

        {/* Quick Action 2: AI Trend Radar */}
        <button
          onClick={onOpenRadarModal}
          className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-teal-950/60 via-[#0b1a14] to-slate-950 border border-teal-800/40 hover:border-teal-500/60 transition shadow-sm group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center group-hover:scale-105 transition">
              <Compass className="w-4 h-4 animate-spin-slow" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white group-hover:text-teal-300 transition">
                  Radar Xu Hướng AI
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[10px] text-slate-400">
                Mô hình mới & Gói Free SV
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-teal-300 group-hover:translate-x-0.5 transition" />
        </button>

        {/* New Task Creation Box */}
        <div className="bg-[#0b1a14]/90 border border-[#133326] rounded-2xl p-3.5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Nhiệm vụ mới
            </span>
            <button
              onClick={() => setShowNewTaskForm(!showNewTaskForm)}
              className="text-[11px] text-slate-400 hover:text-white cursor-pointer"
            >
              {showNewTaskForm ? "Thu gọn" : "Mở rộng"}
            </button>
          </div>

          {showNewTaskForm && (
            <form onSubmit={handleSubmit} className="space-y-3">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Nhập mục tiêu tổng thể bạn muốn hoàn thành... (vd: Viết báo cáo & tạo landing page)"
                rows={3}
                className="w-full bg-[#06110d] border border-[#133326] rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition resize-none placeholder:text-slate-600"
              />

              {/* Suggestions */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Mẫu gợi ý nhanh:
                </span>
                <div className="flex flex-col gap-1.5">
                  {EXAMPLE_PROMPTS.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleUseExample(ex)}
                      className="text-left text-[11px] text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 p-1.5 rounded-lg transition border border-[#133326]/60 truncate cursor-pointer"
                    >
                      {ex}
                    </button>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="pt-2 border-t border-[#133326] flex items-center justify-between text-xs">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoExecute}
                    onChange={(e) => setAutoExecute(e.target.checked)}
                    className="rounded border-[#133326] bg-[#06110d] text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5"
                  />
                  <span className="text-slate-300 text-[11px]">Tự động chạy sau khi phân rã</span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!prompt.trim() || isDecomposing}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isDecomposing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang phân tích & phân rã...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Phân rã thành chuỗi AI</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Task History Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lịch sử quy trình ({tasks.length})
            </span>
          </div>

          <div className="space-y-1.5">
            {tasks.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#133326] text-center text-slate-500 text-xs">
                Chưa có nhiệm vụ nào được tạo
              </div>
            ) : (
              tasks.map((t) => {
                const isActive = t.id === activeTaskId;
                const isCompleted = t.status === "COMPLETED";
                const isRunning = t.status === "RUNNING";

                return (
                  <div
                    key={t.id}
                    onClick={() => onSelectTask(t.id)}
                    className={`group relative p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                      isActive
                        ? "bg-emerald-950/40 border-emerald-500/60 text-white shadow-md shadow-emerald-950/50"
                        : "bg-[#0b1a14]/60 border-[#133326] text-slate-400 hover:border-emerald-700/60 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-medium line-clamp-2 leading-relaxed flex-1">
                        {t.prompt}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask(t.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition rounded"
                        title="Xóa nhiệm vụ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-[#133326]/60">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        {new Date(t.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>

                      {isCompleted ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          Hoàn thành
                        </span>
                      ) : isRunning ? (
                        <span className="flex items-center gap-1 text-teal-400 font-medium animate-pulse">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Đang chạy
                        </span>
                      ) : (
                        <span className="text-slate-500">Chờ kích hoạt</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Footer System Status */}
      <div className="p-3 border-t border-[#133326] bg-[#06110d] flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Hệ thống MoA Sẵn sàng</span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400/80">T9/2026 Live</span>
      </div>
    </div>
  );
}
