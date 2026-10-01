"use client";

import React, { useState } from "react";
import {
  X,
  Zap,
  Code2,
  BookOpen,
  Scale,
  Building2,
  Check,
  ArrowRight,
  Sparkles,
  Clock,
  ShieldCheck,
  Layers,
} from "lucide-react";
import { WORKFLOW_PRESETS, WorkflowPreset } from "@/lib/workflow-presets";
import { MODELS_REGISTRY } from "@/lib/models-registry";

interface WorkflowPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: WorkflowPreset) => void;
}

export function WorkflowPresetsModal({
  isOpen,
  onClose,
  onSelectPreset,
}: WorkflowPresetsModalProps) {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    WORKFLOW_PRESETS[1].id // Default to Software Builder (Standard)
  );

  if (!isOpen) return null;

  const currentPreset =
    WORKFLOW_PRESETS.find((p) => p.id === selectedPresetId) ||
    WORKFLOW_PRESETS[0];

  const getIcon = (id: string) => {
    switch (id) {
      case "preset_quick_assistant":
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case "preset_software_builder":
        return <Code2 className="w-4 h-4 text-teal-400" />;
      case "preset_deep_research":
        return <BookOpen className="w-4 h-4 text-emerald-300" />;
      case "preset_debate_consensus":
        return <Scale className="w-4 h-4 text-cyan-400" />;
      case "preset_enterprise_frontier":
        return <Building2 className="w-4 h-4 text-amber-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-emerald-900/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-950/80 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Thư Viện Mẫu Quy Trình AI (Workflow Presets)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  Từ Nhẹ đến Nặng
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lựa chọn sơ đồ chuỗi AI đã được tối ưu sẵn theo mục đích sử dụng, không cần kiến thức kỹ thuật phức tạp.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Left presets list, Right preset detail */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left: Preset Selection Cards */}
          <div className="md:col-span-5 p-4 border-r border-slate-800/80 overflow-y-auto space-y-2.5 bg-slate-950/50">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
              Chọn Mẫu Sơ Đồ Phù Hợp:
            </div>

            {WORKFLOW_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`w-full text-left p-3 rounded-xl border transition cursor-pointer flex flex-col gap-1.5 ${
                    isSelected
                      ? "bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-white">
                      {getIcon(preset.id)}
                      <span className="line-clamp-1">{preset.name}</span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${preset.badgeColor}`}
                    >
                      {preset.complexityLabel}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-800/40">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Clock className="w-3 h-3" />
                      {preset.estimatedTime}
                    </span>
                    <span className="font-semibold text-slate-300">
                      {preset.costTier}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Detailed Inspection of Selected Preset */}
          <div className="md:col-span-7 p-6 overflow-y-auto space-y-5 bg-slate-900/60">
            {/* Title & Tag */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {currentPreset.tag}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  • {currentPreset.nodes.length} Mô hình phối hợp
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">
                  • {currentPreset.costTier}
                </span>
              </div>
              <h4 className="text-base font-bold text-white mt-1">
                {currentPreset.name}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {currentPreset.description}
              </p>
            </div>

            {/* Best For */}
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-xs">
              <span className="font-bold text-emerald-300">🎯 Tối ưu nhất cho: </span>
              <span className="text-slate-300">{currentPreset.bestFor}</span>
            </div>

            {/* Step-by-step visual chain */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Cấu trúc Chuỗi Luồng AI:
              </div>

              <div className="space-y-2">
                {currentPreset.nodes.map((node, idx) => {
                  const meta = MODELS_REGISTRY[node.suggestedModel];
                  return (
                    <div
                      key={node.id}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center text-[10px] font-bold text-emerald-300 shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{node.title}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-1">
                            {node.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            meta?.badgeColor || "bg-slate-800 text-slate-300"
                          }`}
                        >
                          {meta?.name || node.suggestedModel}
                        </span>
                        <div className="text-[9px] text-emerald-400/80 font-mono mt-0.5">
                          {meta?.provider}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Prompt Template Preview */}
            <div className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl space-y-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase">
                Gợi ý câu lệnh mẫu:
              </div>
              <p className="text-xs text-emerald-300/90 font-mono italic">
                &ldquo;{currentPreset.defaultPrompt}&rdquo;
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tự động kết nối luồng không làm gãy dữ liệu</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Đóng
            </button>
            <button
              onClick={() => {
                onSelectPreset(currentPreset);
                onClose();
              }}
              className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-900/30 cursor-pointer"
            >
              <span>Áp dụng Mẫu Này Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
