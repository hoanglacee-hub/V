"use client";

import React, { useState } from "react";
import { Terminal, ChevronUp, ChevronDown, CheckCircle2, Clock } from "lucide-react";

export interface LogEntry {
  id: string;
  timestamp: string;
  source: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
}

interface LiveConsoleProps {
  logs: LogEntry[];
}

export function LiveConsole({ logs }: LiveConsoleProps) {
  const [isOpen, setIsOpen] = useState(false); // Collapsed by default for a clean, distraction-free view

  return (
    <div className="border-t border-[#133326] bg-[#06110d] flex flex-col transition-all duration-300 select-none">
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 border-b border-[#133326]/60 bg-[#0b1a14]/80 flex items-center justify-between cursor-pointer text-xs text-slate-400 hover:text-white transition"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-300">
            Console Điều Phối (Live Orchestrator Console)
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#06110d] text-emerald-400/80 border border-[#133326] font-mono">
            {logs.length} sự kiện
          </span>
        </div>

        <button className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-emerald-300">
          <span>{isOpen ? "Thu gọn" : "Mở rộng console"}</span>
          {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Log Feed */}
      {isOpen && (
        <div className="h-28 overflow-y-auto p-3 font-mono text-[11px] space-y-1.5 bg-black/60">
          {logs.length === 0 ? (
            <div className="text-slate-600 italic">
              Đang chờ kích hoạt quy trình...
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-start gap-2 leading-relaxed">
                <span className="text-slate-600 shrink-0 select-none">
                  [{log.timestamp}]
                </span>
                <span
                  className={`font-bold shrink-0 ${
                    log.source.includes("Claude")
                      ? "text-amber-400"
                      : log.source.includes("Gemini")
                      ? "text-emerald-400"
                      : log.source.includes("GPT")
                      ? "text-teal-400"
                      : log.source.includes("DeepSeek")
                      ? "text-cyan-400"
                      : "text-emerald-300"
                  }`}
                >
                  [{log.source}]
                </span>
                <span
                  className={`${
                    log.type === "success"
                      ? "text-emerald-300"
                      : log.type === "error"
                      ? "text-rose-400"
                      : "text-slate-300"
                  }`}
                >
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
