"use client";

import React, { useState } from "react";
import { MODELS_REGISTRY } from "@/lib/models-registry";
import { ModelId } from "@/lib/types";
import {
  X,
  Check,
  Zap,
  DollarSign,
  Layers,
  Sparkles,
  AlertTriangle,
  Cpu,
} from "lucide-react";

interface ModelSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentNode: {
    nodeKey: string;
    title: string;
    description: string;
    assignedAi: string;
    promptInput?: string | null;
  } | null;
  onSave: (nodeKey: string, newModel: ModelId, newPrompt: string) => Promise<void>;
}

export function ModelSwitcherModal({
  isOpen,
  onClose,
  currentNode,
  onSave,
}: ModelSwitcherModalProps) {
  const [selectedModel, setSelectedModel] = useState<ModelId>(
    (currentNode?.assignedAi as ModelId) || "claude-3-5-sonnet-20241022"
  );
  const [customPrompt, setCustomPrompt] = useState<string>(
    currentNode?.promptInput || currentNode?.description || ""
  );
  const [filterTier, setFilterTier] = useState<"all" | "free" | "paid">("all");
  const [saving, setSaving] = useState(false);

  // Sync state when currentNode changes
  React.useEffect(() => {
    if (currentNode) {
      setSelectedModel((currentNode.assignedAi as ModelId) || "claude-3-5-sonnet-20241022");
      setCustomPrompt(currentNode.promptInput || currentNode.description || "");
    }
  }, [currentNode]);

  if (!isOpen || !currentNode) return null;

  const handleConfirm = async () => {
    setSaving(true);
    try {
      await onSave(currentNode.nodeKey, selectedModel, customPrompt);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  const activeModelMeta = MODELS_REGISTRY[selectedModel] || MODELS_REGISTRY["gpt-4o"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {currentNode.nodeKey}
              </span>
              <h3 className="text-lg font-bold text-white">
                Tùy chỉnh Mô hình AI & Yêu cầu cho bước: &ldquo;{currentNode.title}&rdquo;
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              So sánh thế mạnh, điểm yếu và chi phí để lựa chọn AI tối ưu nhất cho bước này.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Prompt editing for this node */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              Chỉ dẫn chuyên biệt (Custom Prompt) cho bước này:
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              placeholder="Nhập yêu cầu cụ thể muốn AI này tập trung..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition resize-none"
            />
          </div>

          {/* Model Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-semibold text-slate-300">
                Chọn mô hình AI phụ trách (Nhấp để xem chi tiết ưu/nhược điểm):
              </label>
              <div className="flex items-center gap-1.5 p-0.5 bg-slate-950 border border-slate-800 rounded-lg text-[11px]">
                <button
                  type="button"
                  onClick={() => setFilterTier("all")}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    filterTier === "all" ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Tất cả
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTier("free")}
                  className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1 cursor-pointer ${
                    filterTier === "free" ? "bg-emerald-600 text-white" : "text-emerald-400 hover:text-white"
                  }`}
                >
                  🎓 Sinh viên (Free Tier)
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTier("paid")}
                  className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer ${
                    filterTier === "paid" ? "bg-amber-600 text-white" : "text-amber-400 hover:text-white"
                  }`}
                >
                  💼 Business / Pro
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(Object.keys(MODELS_REGISTRY) as ModelId[])
                .filter((modelId) => {
                  const meta = MODELS_REGISTRY[modelId];
                  if (filterTier === "free") return meta.tier === "free" || meta.tier === "freemium";
                  if (filterTier === "paid") return meta.tier === "paid";
                  return true;
                })
                .map((modelId) => {
                const meta = MODELS_REGISTRY[modelId];
                const isSelected = selectedModel === modelId;
                return (
                  <div
                    key={modelId}
                    onClick={() => setSelectedModel(modelId)}
                    className={`cursor-pointer rounded-xl border p-3.5 transition flex flex-col justify-between ${
                      isSelected
                        ? "bg-blue-600/15 border-blue-500 ring-1 ring-blue-500 shadow-md shadow-blue-500/10"
                        : "bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                        >
                          {meta.provider}
                        </span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <h4 className="font-semibold text-sm text-white mb-1">
                        {meta.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {meta.bestFor}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400" />
                        <span>Tốc độ: {meta.speedRating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-emerald-400" />
                        <span>Chi phí: {meta.costRating}/5</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Model Deep-Dive: Pros & Cons Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4.5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-lg bg-gradient-to-br ${activeModelMeta.avatarColor} flex items-center justify-center text-white font-bold text-sm shadow-inner`}
                >
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    {activeModelMeta.name}
                    <span className="text-xs font-normal text-slate-400">
                      bởi {activeModelMeta.provider}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    {activeModelMeta.description}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-300">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>Ngữ cảnh: <strong>{activeModelMeta.contextWindow}</strong></span>
              </div>
            </div>

            {/* Free Tier Benefit Banner */}
            <div className={`p-3 rounded-lg text-xs flex items-center justify-between border ${
              activeModelMeta.tier === "free"
                ? "bg-emerald-950/30 border-emerald-800/40 text-emerald-300"
                : activeModelMeta.tier === "freemium"
                ? "bg-purple-950/30 border-purple-800/40 text-purple-300"
                : "bg-amber-950/30 border-amber-800/40 text-amber-300"
            }`}>
              <div className="flex items-center gap-2">
                <span className="font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded bg-black/40">
                  {activeModelMeta.tier === "free" ? "🎓 Miễn phí 100%" : activeModelMeta.tier === "freemium" ? "🎁 Tặng Credit" : "💼 Trả phí Pro"}
                </span>
                <span>{activeModelMeta.freeTierBenefit}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* Pros */}
              <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                  <Check className="w-3.5 h-3.5" />
                  <span>ƯU ĐIỂM NỔI BẬT (STRENGTHS):</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeModelMeta.strengths.map((str, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cons */}
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>HẠN CHẾ CẦN LƯU Ý (WEAKNESSES):</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {activeModelMeta.weaknesses.map((weak, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{weak}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-[#06110d]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950/60 disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Đang lưu..." : "Áp dụng cho bước này"}
          </button>
        </div>
      </div>
    </div>
  );
}
