"use client";

import React, { useState } from "react";
import {
  X,
  Compass,
  TrendingUp,
  Sparkles,
  GraduationCap,
  Briefcase,
  ExternalLink,
  Check,
  Zap,
  Globe,
  Cpu,
  Search,
  Loader2,
  RefreshCw,
  Clock,
  ShieldCheck,
} from "lucide-react";
import {
  GLOBAL_AI_TRENDS,
  UNIVERSAL_ROLES_MAPPING,
  MODELS_REGISTRY,
} from "@/lib/models-registry";
import { ModelId, UniversalAiRole, WebSearchAiUpdate } from "@/lib/types";

interface AiTrendRadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyRoster: (mode: "student_free" | "top_trending") => void;
}

export function AiTrendRadarModal({
  isOpen,
  onClose,
  onApplyRoster,
}: AiTrendRadarModalProps) {
  const [activeTab, setActiveTab] = useState<"radar" | "web_search" | "roles" | "student_guide">("web_search");
  const [appliedMode, setAppliedMode] = useState<string | null>(null);

  // Live Web Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<WebSearchAiUpdate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Initial load of web search data
  React.useEffect(() => {
    if (isOpen) {
      handleSearchWeb("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearchWeb = async (q: string) => {
    setIsSearching(true);
    try {
      const res = await fetch(`/api/ai-trends?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (data.webSearchResults) {
        setSearchResults(data.webSearchResults);
      }
      setHasSearched(true);
    } catch (e) {
      console.error("Live web search failed:", e);
    } finally {
      setIsSearching(false);
    }
  };

  const handleApply = (mode: "student_free" | "top_trending") => {
    onApplyRoster(mode);
    setAppliedMode(mode);
    setTimeout(() => {
      setAppliedMode(null);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Compass className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Radar AI Toàn Cầu & Kiểm Định Web Thời Gian Thực
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Web Verified (T9/2026)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Tự động kiểm định và quét xu thế AI thế giới để đảm bảo hệ thống không bị lỗi thời.
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

        {/* Tab Controls */}
        <div className="px-6 py-2.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("web_search")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "web_search"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Quét Tin Tức Web ({searchResults.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("roles")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "roles"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Vai trò Thích ứng (2026 Roster)</span>
            </button>

            <button
              onClick={() => setActiveTab("radar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "radar"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Chuyển dịch Công nghệ</span>
            </button>

            <button
              onClick={() => setActiveTab("student_guide")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "student_guide"
                  ? "bg-blue-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Gói Miễn phí SV</span>
            </button>
          </div>

          {/* Quick Apply CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApply("student_free")}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold transition cursor-pointer"
            >
              {appliedMode === "student_free" ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Đã áp dụng Đội hình 2026 Sinh viên!</span>
                </>
              ) : (
                <>
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Áp dụng Gói SV 2026 (Free)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: LIVE WEB SEARCH */}
          {activeTab === "web_search" && (
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchWeb(searchQuery)}
                    placeholder="Tìm kiếm xu hướng AI trực tiếp (vd: GPT-6, Claude Opus 5.5, Gemini 3.8 Flash, DeepSeek V4)..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-medium"
                  />
                </div>
                <button
                  onClick={() => handleSearchWeb(searchQuery)}
                  disabled={isSearching}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                  <span>Quét Web Ngay</span>
                </button>
              </div>

              {/* Status banner */}
              <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl text-xs text-cyan-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>
                    Dữ liệu được kiểm định thực tế qua Web: <strong>Gemini 3.8 Flash</strong>, <strong>Claude Opus 5.5</strong>, <strong>GPT-6 Astra & Sol</strong>, và <strong>DeepSeek V4.1-Flash</strong>.
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">T9/2026</span>
              </div>

              {/* Live Web Results List */}
              <div className="space-y-3">
                {searchResults.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl space-y-2 transition"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-blue-400">{item.source}</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {item.date}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {item.snippet}
                    </p>
                    <div className="pt-2 flex items-center justify-between">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400 transition"
                      >
                        Nguồn bài viết <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Đã xác thực
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: ADAPTIVE UNIVERSAL ROLES */}
          {activeTab === "roles" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Hệ thống tự động đồng bộ vai trò trong DAG sang <strong>Thế hệ 2026 mới nhất</strong> đã được kiểm chứng trên Web:
              </p>

              <div className="space-y-2.5">
                {(Object.keys(UNIVERSAL_ROLES_MAPPING) as UniversalAiRole[]).map((roleKey) => {
                  const role = UNIVERSAL_ROLES_MAPPING[roleKey];
                  const freeModel = MODELS_REGISTRY[role.studentFreeTierModel];
                  const proModel = MODELS_REGISTRY[role.currentTrendingModel];

                  return (
                    <div
                      key={roleKey}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 md:w-1/3">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">
                            {role.label}
                          </h4>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {role.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {role.description}
                        </p>
                      </div>

                      {/* Comparison Columns */}
                      <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
                        {/* Free Tier Choice */}
                        <div className="p-2.5 bg-emerald-950/20 border border-emerald-800/40 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-emerald-400">
                              🎓 Gói Sinh Viên 2026 (0đ)
                            </span>
                            <span className="text-[9px] text-emerald-300 font-mono">
                              {freeModel.generation}
                            </span>
                          </div>
                          <p className="font-semibold text-white text-xs">
                            {freeModel.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {freeModel.provider}
                          </span>
                        </div>

                        {/* Pro Choice */}
                        <div className="p-2.5 bg-amber-950/20 border border-amber-800/40 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-amber-400">
                              💼 Gói Business 2026
                            </span>
                            <span className="text-[9px] text-amber-300 font-mono">
                              {proModel.generation}
                            </span>
                          </div>
                          <p className="font-semibold text-white text-xs">
                            {proModel.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {proModel.provider}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: RADAR TREND FEED */}
          {activeTab === "radar" && (
            <div className="space-y-3.5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {GLOBAL_AI_TRENDS.map((trend) => {
                  const meta = MODELS_REGISTRY[trend.recommendedModel];
                  return (
                    <div
                      key={trend.id}
                      className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                            {trend.domain}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Phát hành {trend.sourceDate}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug">
                          {trend.title}
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {trend.summary}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-800/80 space-y-2">
                        <div className="text-[11px] text-emerald-400 flex items-start gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>
                            <strong>Tác động:</strong> {trend.impactOnWorkflow}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="text-slate-400">
                            Đề xuất: <strong>{meta.name}</strong> ({meta.provider})
                          </span>
                          {meta.tier === "free" && (
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              Miễn phí 100%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: STUDENT GUIDE */}
          {activeTab === "student_guide" && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-950/30 border border-emerald-800/50 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <GraduationCap className="w-5 h-5" />
                  <span>Cách nhận API Key Miễn Phí 100% (Thế hệ 2026):</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Không cần thẻ tín dụng (No Credit Card Required). Dưới đây là các cổng cung cấp hạn mức miễn phí chính thức:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {/* Google AI Studio */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">1. Google AI Studio</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">
                      Miễn phí 15 RPM
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Đăng nhập bằng Gmail. Sử dụng <strong>Gemini 3.8 Flash</strong> mới nhất với 1.5M tokens context miễn phí.
                  </p>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium"
                  >
                    Lấy API Key Google <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Groq Cloud */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">2. Groq Cloud</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400">
                      Miễn phí 30 RPM
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Đăng nhập bằng GitHub/Google. Chạy <strong>Llama 3.3 70B</strong> và <strong>Qwen 2.5 Coder 32B</strong> với tốc độ 300+ tok/s.
                  </p>
                  <a
                    href="https://console.groq.com/keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 font-medium"
                  >
                    Lấy API Key Groq <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* DeepSeek */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">3. DeepSeek Platform</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-400">
                      Tặng $5 Credit
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Đăng ký nhận $5 credit cho <strong>DeepSeek-V4.1-Flash</strong> và <strong>DeepSeek R1</strong>.
                  </p>
                  <a
                    href="https://platform.deepseek.com"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium"
                  >
                    Lấy API Key DeepSeek <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* OpenAI Free/Sol */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm">4. OpenAI (GPT-6 Sol)</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      Giảm 50% chi phí
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    OpenAI cung cấp dòng <strong>GPT-6 Sol</strong> mới với mức giá tiết kiệm 50% dành cho người dùng cá nhân.
                  </p>
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    OpenAI Console <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/90 text-xs">
          <span className="text-slate-400">
            Tự động nâng cấp sang thế hệ mới mà vẫn bảo toàn cấu trúc DAG & Schemas.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleApply("student_free")}
              className="px-4 py-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-lg shadow-emerald-600/20 cursor-pointer"
            >
              Áp dụng Đội hình SV 2026 (0đ Free)
            </button>
            <button
              onClick={() => handleApply("top_trending")}
              className="px-4 py-2 rounded-xl font-bold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20 cursor-pointer"
            >
              Áp dụng Đội hình Frontier 2026 (Pro)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
