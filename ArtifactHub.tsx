"use client";

import React, { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  FileText,
  Copy,
  Download,
  Check,
  Cpu,
  Layers,
  Sparkles,
  Loader2,
  ChevronLeft,
  Send,
  CheckCircle2,
  Code2,
  Play,
  Archive,
  ArrowRight,
  Zap,
} from "lucide-react";
import { MODELS_REGISTRY } from "@/lib/models-registry";
import { ModelId, ApiKeyConfig } from "@/lib/types";
import { ProjectRoadmap } from "./ProjectRoadmap";
import { LiveAppPreview } from "./LiveAppPreview";
import {
  parseArtifactFiles,
  downloadSingleFile,
  downloadProjectZip,
} from "@/lib/artifactParser";

interface ArtifactHubProps {
  taskId?: string;
  taskGoal?: string;
  artifact: {
    id?: string;
    type: string;
    content: string;
  } | null;
  nodes: Array<{
    nodeKey: string;
    title: string;
    description: string;
    assignedAi: string;
    status: string;
    rawOutput?: string | null;
    latencyMs?: number | null;
    tokensUsed?: number | null;
  }>;
  isExecuting: boolean;
  activeInspectNodeKey?: string | null;
  onClearInspect?: () => void;
  onBackToCanvas?: () => void;
  onArtifactUpdated?: (newContent: string) => void;
  apiKeys?: ApiKeyConfig;
  onExecuteRefineCommand?: (instruction: string) => Promise<void>;
}

// Dedicated code block renderer with individual file path, download button and copy button
function CodeBlockWithActions({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  // Recursively extract text from React children
  const extractText = (node: any): string => {
    if (!node) return "";
    if (typeof node === "string") return node;
    if (typeof node === "number") return String(node);
    if (Array.isArray(node)) return node.map(extractText).join("");
    if (node.props?.children) return extractText(node.props.children);
    return "";
  };

  const rawCode = extractText(children);
  const lines = rawCode.split("\n");
  const firstLine = lines[0]?.trim() || "";

  // Detect filename from comments: // path/file.ext, /* path/file.ext */, # path/file.ext
  let detectedPath = "";
  const match =
    firstLine.match(/^\/\/\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/) ||
    firstLine.match(/^\/\*\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)\s*\*\//) ||
    firstLine.match(/^#\s*([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+)/);

  if (match) {
    detectedPath = match[1];
  } else if (rawCode.includes("import ") && rawCode.includes("export ")) {
    detectedPath =
      rawCode.includes("return <") || rawCode.includes("React")
        ? "components/ExamClassifierApp.tsx"
        : "lib/engine.ts";
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(rawCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const filename = detectedPath.split("/").pop() || "code.txt";
    downloadSingleFile(filename, rawCode);
  };

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-[#133326] bg-[#06110d] shadow-xl group">
      {/* File Header Bar */}
      <div className="px-4 py-2.5 bg-[#0b1a14] border-b border-[#133326] text-[11px] text-emerald-400 font-mono flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-semibold text-slate-200">
            {detectedPath || "Mã nguồn hoàn chỉnh (Production Code)"}
          </span>
          <span className="text-[10px] text-slate-500 font-sans">
            ({lines.length} dòng)
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleDownloadCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#06110d] hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-[#133326] transition text-[11px] cursor-pointer"
            title="Tải tệp mã nguồn này về máy"
          >
            <Download className="w-3 h-3" />
            <span>Tải tệp</span>
          </button>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#06110d] hover:bg-emerald-950/60 text-slate-300 hover:text-emerald-300 border border-[#133326] transition text-[11px] cursor-pointer"
            title="Sao chép toàn bộ khối mã này"
          >
            {copied ? (
              <Check className="w-3 h-3 text-emerald-400" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
            <span>{copied ? "Đã chép" : "Sao chép"}</span>
          </button>
        </div>
      </div>

      <pre className="p-4 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed">
        {children}
      </pre>
    </div>
  );
}

export function ArtifactHub({
  taskId,
  taskGoal = "Dự án AI",
  artifact,
  nodes,
  isExecuting,
  activeInspectNodeKey,
  onClearInspect,
  onBackToCanvas,
  onArtifactUpdated,
  apiKeys,
  onExecuteRefineCommand,
}: ArtifactHubProps) {
  const [activeTab, setActiveTab] = useState<"final" | "preview" | "roadmap" | "inspect">("final");
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [selectedInspectNode, setSelectedInspectNode] = useState<string>(
    activeInspectNodeKey || (nodes.length > 0 ? nodes[0].nodeKey : "")
  );

  // Co-Pilot Chat refinement state
  const [refinePrompt, setRefinePrompt] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [refineStatus, setRefineStatus] = useState<string | null>(null);

  // Extract files from artifact
  const extractedFiles = useMemo(() => {
    return parseArtifactFiles(artifact?.content || "");
  }, [artifact?.content]);

  // Sync if parent requested inspection of a specific node
  React.useEffect(() => {
    if (activeInspectNodeKey) {
      setSelectedInspectNode(activeInspectNodeKey);
      setActiveTab("inspect");
    }
  }, [activeInspectNodeKey]);

  const handleCopy = () => {
    const textToCopy =
      activeTab === "final" || activeTab === "preview"
        ? artifact?.content || ""
        : nodes.find((n) => n.nodeKey === selectedInspectNode)?.rawOutput || "";
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleDownload = () => {
    const textToDownload =
      activeTab === "final" || activeTab === "preview"
        ? artifact?.content || ""
        : nodes.find((n) => n.nodeKey === selectedInspectNode)?.rawOutput || "";
    if (!textToDownload) return;

    const blob = new Blob([textToDownload], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-${activeTab}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZipPackage = async () => {
    if (!artifact?.content || isZipping) return;
    setIsZipping(true);
    try {
      await downloadProjectZip(taskGoal, artifact.content);
    } catch (err) {
      console.error("Zip download failed:", err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleRefineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const commandText = refinePrompt.trim();
    if (!commandText || !taskId || isRefining || isExecuting) return;

    setIsRefining(true);
    setRefineStatus("⚡ Đang kích hoạt Chuỗi Điều Phối Can Thiệp Đa AI qua Workflow...");

    try {
      if (onExecuteRefineCommand) {
        await onExecuteRefineCommand(commandText);
        setRefineStatus(`✔ Đã thực thi thành công lệnh điều hành: "${commandText}"`);
        setRefinePrompt("");
        setTimeout(() => setRefineStatus(null), 5000);
      } else {
        const res = await fetch(`/api/tasks/${taskId}/refine`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instruction: commandText,
            apiKeys,
          }),
        });
        const data = await res.json();
        if (data.updatedContent) {
          onArtifactUpdated?.(data.updatedContent);
          setRefineStatus(data.replyMessage || "Đã áp dụng thay đổi thành công!");
          setRefinePrompt("");
          setTimeout(() => setRefineStatus(null), 3500);
        }
      }
    } catch (err) {
      console.error("Refine failed:", err);
      setRefineStatus("Có lỗi khi kết nối tới máy chủ điều phối");
    } finally {
      setIsRefining(false);
    }
  };

  const currentNodeToInspect = nodes.find((n) => n.nodeKey === selectedInspectNode);
  const modelMeta = currentNodeToInspect
    ? MODELS_REGISTRY[currentNodeToInspect.assignedAi as ModelId] ||
      MODELS_REGISTRY["gemini-3-8-flash"] ||
      MODELS_REGISTRY["gpt-4o"]
    : null;

  return (
    <div className="w-full h-full flex flex-col bg-[#0b1a14] border-l border-[#133326]">
      {/* Top Header & Tab Switcher */}
      <div className="p-3.5 border-b border-[#133326] flex flex-wrap items-center justify-between gap-3 bg-[#06110d]/80 shrink-0">
        <div className="flex items-center gap-2">
          {onBackToCanvas && (
            <button
              onClick={onBackToCanvas}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-emerald-950/40 transition cursor-pointer"
              title="Quay lại sơ đồ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#06110d] border border-[#133326] rounded-xl">
            {/* Tab 1: Final Product & Source Code */}
            <button
              onClick={() => {
                setActiveTab("final");
                onClearInspect?.();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "final"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Sản phẩm & Mã nguồn</span>
              {artifact?.content && (
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
              )}
            </button>

            {/* Tab 2: Live Preview & Interactive Runner */}
            <button
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "preview"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chạy thử nghiệm</span>
              <span className="px-1.5 py-0.2 rounded-md bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px]">
                Live
              </span>
            </button>

            {/* Tab 3: Project Roadmap */}
            <button
              onClick={() => setActiveTab("roadmap")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "roadmap"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                Tiến độ ({nodes.filter((n) => n.status === "COMPLETED").length}/{nodes.length})
              </span>
            </button>

            {/* Tab 4: Inspect Subtasks */}
            <button
              onClick={() => setActiveTab("inspect")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === "inspect"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-950/50"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Bóc tách từng AI</span>
            </button>
          </div>
        </div>

        {/* Action icons & ZIP Download Button */}
        <div className="flex items-center gap-2">
          {artifact?.content && (
            <button
              onClick={handleDownloadZipPackage}
              disabled={isZipping}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/50 cursor-pointer disabled:opacity-50"
              title="Tải toàn bộ dự án gồm tất cả tệp mã nguồn và README vào file ZIP"
            >
              {isZipping ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Archive className="w-3.5 h-3.5" />
              )}
              <span>Tải ZIP dự án</span>
              {extractedFiles.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-950/60 text-emerald-200 text-[10px] border border-emerald-400/40">
                  {extractedFiles.length} tệp
                </span>
              )}
            </button>
          )}

          <div className="flex items-center gap-1 pl-1 border-l border-[#133326]">
            <button
              onClick={handleCopy}
              disabled={!artifact?.content && !currentNodeToInspect?.rawOutput}
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition disabled:opacity-30 cursor-pointer"
              title="Sao chép toàn bộ nội dung Markdown"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={handleDownload}
              disabled={!artifact?.content && !currentNodeToInspect?.rawOutput}
              className="p-2 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/40 transition disabled:opacity-30 cursor-pointer"
              title="Tải tệp Markdown (.md)"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-[#06110d]/40">
        {/* TAB 1: Real Product Deliverable & Source Code */}
        {activeTab === "final" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Quick Actions Callout Banner */}
            {artifact && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0b1a14] to-[#0e251c] border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      <span>Mã nguồn hoàn chỉnh đã sẵn sàng!</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-500/40 font-mono">
                        {extractedFiles.length} tệp nguồn
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Bạn có thể chạy thử nghiệm trực tiếp trên web hoặc tải file .ZIP về máy để chạy ngay.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("preview")}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-950/50 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Chạy thử ngay</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={handleDownloadZipPackage}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#06110d] hover:bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Tải ZIP</span>
                  </button>
                </div>
              </div>
            )}

            {isExecuting ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                <h4 className="text-sm font-semibold text-slate-200">
                  Đang điều phối các AI thực thi...
                </h4>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Hệ thống đang chạy các mini-tasks và sẽ tự động tổng hợp thành sản phẩm hoàn chỉnh khi xong.
                </p>
              </div>
            ) : !artifact && nodes.every((n) => n.status !== "COMPLETED") ? (
              <div className="py-20 flex flex-col items-center justify-center text-center space-y-3 text-slate-400">
                <div className="w-12 h-12 rounded-2xl bg-[#0b1a14] border border-[#133326] flex items-center justify-center text-emerald-400">
                  <FileText className="w-6 h-6 text-emerald-500" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Chưa có sản phẩm hoàn chỉnh
                </h4>
                <p className="text-xs max-w-xs text-slate-400 leading-relaxed">
                  Nhấn nút &ldquo;Kích hoạt thực thi DAG&rdquo; ở sơ đồ giữa để kích hoạt chuỗi AI và tạo sản phẩm.
                </p>
              </div>
            ) : artifact ? (
              <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-4">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    h1: ({ ...props }) => (
                      <h1
                        className="text-2xl font-extrabold text-white pb-3 border-b border-[#133326] mt-2 mb-4 text-emerald-300"
                        {...props}
                      />
                    ),
                    h2: ({ ...props }) => (
                      <h2
                        className="text-lg font-bold text-slate-100 mt-6 mb-3 flex items-center gap-2 border-l-2 border-emerald-500 pl-3"
                        {...props}
                      />
                    ),
                    h3: ({ ...props }) => (
                      <h3
                        className="text-sm font-bold text-emerald-400 mt-4 mb-2"
                        {...props}
                      />
                    ),
                    p: ({ ...props }) => (
                      <p className="text-slate-300 leading-relaxed mb-3" {...props} />
                    ),
                    ul: ({ ...props }) => (
                      <ul className="list-disc list-inside space-y-1.5 my-2 text-slate-300" {...props} />
                    ),
                    ol: ({ ...props }) => (
                      <ol className="list-decimal list-inside space-y-1.5 my-2 text-slate-300" {...props} />
                    ),
                    pre: ({ children }: React.ComponentPropsWithoutRef<'pre'>) => (
                      <CodeBlockWithActions>
                        {children}
                      </CodeBlockWithActions>
                    ),
                    code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
                      const isCodeBlock =
                        className?.includes('language-') ||
                        (typeof children === 'string' && children.includes('\n'));
                      if (!isCodeBlock) {
                        return (
                          <code
                            className="bg-[#0b1a14] text-emerald-300 border border-emerald-900/50 px-1.5 py-0.5 rounded text-xs font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    blockquote: ({ ...props }) => (
                      <blockquote
                        className="border-l-4 border-emerald-500 bg-emerald-950/20 pl-4 py-2 my-3 rounded-r-lg text-emerald-200/90 italic"
                        {...props}
                      />
                    ),
                  }}
                >
                  {artifact.content}
                </ReactMarkdown>
              </div>
            ) : null}
          </div>
        )}

        {/* TAB 2: Live Interactive Runner & Sandbox */}
        {activeTab === "preview" && (
          <LiveAppPreview
            taskGoal={taskGoal}
            fullArtifactContent={artifact?.content || ""}
          />
        )}

        {/* TAB 3: Project Roadmap & Execution Progress */}
        {activeTab === "roadmap" && (
          <ProjectRoadmap
            nodes={nodes}
            taskGoal={taskGoal}
            isCompleted={Boolean(artifact?.content)}
          />
        )}

        {/* TAB 4: Inspect Individual Subtasks */}
        {activeTab === "inspect" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            {/* Horizontal Subtask selector pill list */}
            <div className="flex flex-wrap gap-2 pb-3 border-b border-[#133326]">
              {nodes.map((node) => {
                const isSelected = node.nodeKey === selectedInspectNode;
                return (
                  <button
                    key={node.nodeKey}
                    onClick={() => setSelectedInspectNode(node.nodeKey)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                      isSelected
                        ? "bg-[#06110d] text-emerald-300 border border-emerald-500/60 shadow-sm"
                        : "bg-[#0b1a14]/60 text-slate-400 border border-[#133326] hover:text-slate-200"
                    }`}
                  >
                    <span>{node.title}</span>
                    {node.rawOutput && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Subtask Details */}
            {currentNodeToInspect ? (
              <div className="space-y-4">
                {/* Header card for this AI */}
                <div className="p-4 rounded-xl bg-[#06110d] border border-[#133326] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#0b1a14] border border-[#133326] flex items-center justify-center text-emerald-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                        <span>{currentNodeToInspect.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                          {currentNodeToInspect.status}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">
                        {modelMeta?.name || currentNodeToInspect.assignedAi} • {modelMeta?.provider || "Tối ưu hóa"}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs space-y-0.5">
                    {currentNodeToInspect.latencyMs && (
                      <div className="text-slate-400">
                        Độ trễ: <span className="text-emerald-300 font-mono">{currentNodeToInspect.latencyMs}ms</span>
                      </div>
                    )}
                    {currentNodeToInspect.tokensUsed && (
                      <div className="text-slate-400">
                        Tokens: <span className="text-emerald-300 font-mono">{currentNodeToInspect.tokensUsed}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtask raw output */}
                {currentNodeToInspect.rawOutput ? (
                  <div className="p-4 rounded-xl bg-[#06110d] border border-[#133326] text-xs font-mono text-emerald-300">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        pre: ({ children }: React.ComponentPropsWithoutRef<'pre'>) => (
                          <pre className="p-3 bg-[#0b1a14] rounded-lg overflow-x-auto text-emerald-300 border border-[#133326] my-2">
                            {children}
                          </pre>
                        ),
                        code: ({ className, children, ...props }: React.ComponentPropsWithoutRef<'code'>) => {
                          const isCodeBlock =
                            className?.includes('language-') ||
                            (typeof children === 'string' && children.includes('\n'));
                          if (!isCodeBlock) {
                            return (
                              <code className="bg-[#0b1a14] text-emerald-300 border border-emerald-900/50 px-1 py-0.5 rounded text-[11px] font-mono" {...props}>
                                {children}
                              </code>
                            );
                          }
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {currentNodeToInspect.rawOutput}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-500 text-xs">
                    Bước này chưa có output. Hãy chạy DAG để xem kết quả.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {/* Real-time Project Command & Co-Pilot Execution Bar */}
      {artifact && (
        <div className="p-4 border-t border-[#133326] bg-[#06110d] space-y-2.5 shrink-0 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Zap className="w-3.5 h-3.5 fill-emerald-400" />
              </div>
              <span className="font-bold text-slate-100">
                LỆNH ĐIỀU HÀNH DỰ ÁN TRỰC TIẾP (CO-PILOT COMMAND)
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold tracking-wide">
              ⚡ QUYỀN THỰC THI TUYỆT ĐỐI • CHẠY TRỰC TIẾP QUA WORKFLOW
            </span>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="flex flex-wrap gap-1.5">
            {[
              "⚡ Thêm nút xuất đề thi ra file JSON",
              "🔧 Tối ưu thuật toán tính điểm độ khó",
              "🧪 Bổ sung Unit Tests kiểm thử tự động",
              "🌐 Chuyển đổi giao diện song ngữ Anh - Việt",
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRefinePrompt(chip.replace(/^[^a-zA-Z0-9À-ỹ]+/, "").trim())}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-[#0b1a14] border border-[#133326] text-slate-400 hover:text-emerald-300 hover:border-emerald-700/60 transition cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input & Send Form */}
          <form onSubmit={handleRefineSubmit} className="flex gap-2">
            <input
              type="text"
              value={refinePrompt}
              onChange={(e) => setRefinePrompt(e.target.value)}
              disabled={isRefining || isExecuting}
              placeholder="Nhập lệnh điều hành dự án (vd: Thêm xuất đề thi ra file JSON, đổi thuật toán sang 6 mức Bloom, thêm đếm ngược thời gian...)"
              className="flex-1 bg-[#0b1a14] border border-[#133326] rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 placeholder:text-slate-600 font-medium disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!refinePrompt.trim() || isRefining || isExecuting}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-emerald-950/60 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
            >
              {isRefining || isExecuting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang chạy qua workflow...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Thực thi qua Workflow</span>
                </>
              )}
            </button>
          </form>

          {refineStatus && (
            <div className="text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>{refineStatus}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
