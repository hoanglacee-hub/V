"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Key,
  ShieldCheck,
  ExternalLink,
  Check,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Wifi,
} from "lucide-react";
import { ApiKeyConfig } from "@/lib/types";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveKeys: (keys: ApiKeyConfig) => void;
}

interface TestResult {
  testing: boolean;
  valid?: boolean;
  latencyMs?: number;
  message?: string;
  error?: string;
}

export function ApiKeyModal({ isOpen, onClose, onSaveKeys }: ApiKeyModalProps) {
  const [keys, setKeys] = useState<ApiKeyConfig>({
    openaiApiKey: "",
    anthropicApiKey: "",
    geminiApiKey: "",
    deepseekApiKey: "",
    groqApiKey: "",
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});

  useEffect(() => {
    try {
      const stored = localStorage.getItem("orchestrai_api_keys");
      if (stored) {
        setKeys(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestKey = async (provider: "google" | "groq" | "openai" | "anthropic" | "deepseek", apiKey?: string) => {
    if (!apiKey || !apiKey.trim()) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { testing: false, valid: false, error: "Vui lòng nhập API key trước" },
      }));
      return;
    }

    setTestResults((prev) => ({
      ...prev,
      [provider]: { testing: true },
    }));

    try {
      const res = await fetch("/api/keys/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, apiKey }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [provider]: {
          testing: false,
          valid: data.valid,
          latencyMs: data.latencyMs,
          message: data.message,
          error: data.error,
        },
      }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [provider]: { testing: false, valid: false, error: "Không thể kết nối đến máy chủ kiểm thử" },
      }));
    }
  };

  const handleSave = () => {
    localStorage.setItem("orchestrai_api_keys", JSON.stringify(keys));
    onSaveKeys(keys);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  const renderTestBadge = (provider: string) => {
    const res = testResults[provider];
    if (!res) return null;
    if (res.testing) {
      return (
        <span className="flex items-center gap-1 text-[11px] text-teal-400 font-medium">
          <Loader2 className="w-3 h-3 animate-spin" />
          Đang kiểm thử trực tiếp...
        </span>
      );
    }
    if (res.valid) {
      return (
        <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
          <CheckCircle2 className="w-3 h-3" />
          Hoạt động tốt ({res.latencyMs}ms)
        </span>
      );
    }
    if (res.error) {
      return (
        <span className="flex items-center gap-1 text-[11px] text-rose-400 font-semibold bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full" title={res.error}>
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span className="line-clamp-1 max-w-[200px]">{res.error}</span>
        </span>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-[#133326] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#133326] bg-[#06110d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cài đặt & Kiểm Thử Khóa API Trực Tiếp (BYOK)
              </h3>
              <p className="text-xs text-slate-400">
                Kiểm tra kết nối và độ trễ thực tế đến các nhà cung cấp AI trong thời gian thực.
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

        {/* Form Body */}
        <div className="p-6 space-y-4 overflow-y-auto bg-[#0b1a14]/60">
          <div className="flex items-center gap-2 p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-xs text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>
              Khóa API được lưu cục bộ an toàn trên trình duyệt của bạn (Local Storage). Nếu không có key, hệ thống tự động chạy qua mô phỏng thông minh cho sinh viên trải nghiệm.
            </span>
          </div>

          {/* 1. Google Gemini */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#06110d] border border-[#133326]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">Google Gemini API Key</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                  100% Free
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderTestBadge("google")}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                >
                  Lấy key 0đ <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={keys.geminiApiKey || ""}
                onChange={(e) => setKeys({ ...keys, geminiApiKey: e.target.value })}
                placeholder="AIzaSy..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleTestKey("google", keys.geminiApiKey)}
                disabled={testResults["google"]?.testing}
                className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {testResults["google"]?.testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Miễn phí 15 RPM / 1M token/ngày trên Google AI Studio (Gemini 3.8 Flash & 3.8 Live).</p>
          </div>

          {/* 2. Groq Cloud */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#06110d] border border-[#133326]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">Groq Cloud API Key</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                  100% Free
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderTestBadge("groq")}
                <a
                  href="https://console.groq.com/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                >
                  Lấy key 0đ <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={keys.groqApiKey || ""}
                onChange={(e) => setKeys({ ...keys, groqApiKey: e.target.value })}
                placeholder="gsk_..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleTestKey("groq", keys.groqApiKey)}
                disabled={testResults["groq"]?.testing}
                className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {testResults["groq"]?.testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Tốc độ 300+ token/s miễn phí trên Llama 3.3 70B & Qwen 2.5 Coder 32B.</p>
          </div>

          {/* 3. DeepSeek */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#06110d] border border-[#133326]">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-white">DeepSeek API Key</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-400">
                  Siêu rẻ
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderTestBadge("deepseek")}
                <a
                  href="https://platform.deepseek.com/api_keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                >
                  Lấy key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={keys.deepseekApiKey || ""}
                onChange={(e) => setKeys({ ...keys, deepseekApiKey: e.target.value })}
                placeholder="sk-..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleTestKey("deepseek", keys.deepseekApiKey)}
                disabled={testResults["deepseek"]?.testing}
                className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {testResults["deepseek"]?.testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">Mô hình MoE DeepSeek-V4.1-Flash & R1 cho giải toán và logic thuật toán.</p>
          </div>

          {/* 4. OpenAI */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#06110d] border border-[#133326]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">OpenAI API Key (GPT-6 Astra / Sol)</span>
              <div className="flex items-center gap-2">
                {renderTestBadge("openai")}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                >
                  Lấy key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={keys.openaiApiKey || ""}
                onChange={(e) => setKeys({ ...keys, openaiApiKey: e.target.value })}
                placeholder="sk-proj-..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleTestKey("openai", keys.openaiApiKey)}
                disabled={testResults["openai"]?.testing}
                className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {testResults["openai"]?.testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 5. Anthropic */}
          <div className="space-y-1.5 p-3 rounded-xl bg-[#06110d] border border-[#133326]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Anthropic API Key (Claude Opus 5.5 / 3.7)</span>
              <div className="flex items-center gap-2">
                {renderTestBadge("anthropic")}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
                >
                  Lấy key <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="password"
                value={keys.anthropicApiKey || ""}
                onChange={(e) => setKeys({ ...keys, anthropicApiKey: e.target.value })}
                placeholder="sk-ant-..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => handleTestKey("anthropic", keys.anthropicApiKey)}
                disabled={testResults["anthropic"]?.testing}
                className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-700/50 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0 disabled:opacity-50"
              >
                {testResults["anthropic"]?.testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#133326] bg-[#06110d]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-950/60 cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Đã lưu thành công!</span>
              </>
            ) : (
              <span>Lưu Cấu Hình Key</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
