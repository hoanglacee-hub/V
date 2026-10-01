"use client";

import { useState, useEffect, useCallback } from "react";

interface Housemate {
  id: string;
  name: string;
  emoji: string;
  color: string;
  order: number;
}

interface ChoreLog {
  id: string;
  choreId: string;
  housemateId: string;
  round: number;
  completedAt: string;
  housemate: Housemate;
}

interface Chore {
  id: string;
  name: string;
  emoji: string;
  currentRound: number;
  logs: ChoreLog[];
}

export default function ChamCongPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [housemates, setHousemates] = useState<Housemate[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [celebrateChore, setCelebrateChore] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [choresRes, hmRes] = await Promise.all([
        fetch("/api/cham-cong/chores"),
        fetch("/api/cham-cong/housemates"),
      ]);
      setChores(await choresRes.json());
      setHousemates(await hmRes.json());
    } catch {
      console.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Chấm công
  const handleComplete = async (choreId: string, housemateId: string) => {
    const key = choreId + "-" + housemateId;
    setProcessing(key);
    try {
      const res = await fetch("/api/cham-cong/chores/" + choreId + "/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ housemateId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Có lỗi xảy ra");
        return;
      }

      const result = await res.json();

      // Nếu hoàn thành lượt → animation
      if (result.roundCompleted) {
        setCelebrateChore(choreId);
        setTimeout(() => setCelebrateChore(null), 2000);
      }

      await loadData();
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setProcessing(null);
    }
  };

  // Hủy chấm công
  const handleUndo = async (
    choreId: string,
    housemateId: string,
    round: number
  ) => {
    if (!confirm("Hủy chấm công này?")) return;
    setProcessing(choreId + "-" + housemateId);
    try {
      await fetch(
        "/api/cham-cong/chores/" + choreId + "/complete?housemateId=" + housemateId + "&round=" + round,
        { method: "DELETE" }
      );
      await loadData();
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 mt-4 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (housemates.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-4 block">👥</span>
        <h2 className="text-xl font-bold text-white mb-2">
          Chưa có thành viên nào!
        </h2>
        <p className="text-slate-400 mb-6">
          Hãy thêm 4 thành viên trong phòng trọ trước.
        </p>
        <a
          href="/cham-cong/thanh-vien"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Thêm thành viên →
        </a>
      </div>
    );
  }

  if (chores.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl mb-4 block">📋</span>
        <h2 className="text-xl font-bold text-white mb-2">
          Chưa có công việc nào!
        </h2>
        <p className="text-slate-400 mb-6">
          Hãy tạo công việc nhà (lấy nước, quét nhà, ...)
        </p>
        <a
          href="/cham-cong/cong-viec"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors"
        >
          Tạo công việc →
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">📋 Bảng Chấm Công</h1>
        <p className="text-slate-400 mt-1">
          Nhấn vào ô của bạn để chấm công. Đủ {housemates.length} người = hoàn thành 1 lượt!
        </p>
      </div>

      {/* Legend - Chú thích 4 marks */}
      <div className="flex items-center gap-3 flex-wrap">
        {housemates.map((hm) => (
          <div
            key={hm.id}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm"
            style={{
              borderColor: hm.color + "40",
              backgroundColor: hm.color + "15",
            }}
          >
            <span className="text-lg">{hm.emoji}</span>
            <span style={{ color: hm.color }} className="font-medium">
              {hm.name}
            </span>
          </div>
        ))}
      </div>

      {/* Chore Cards */}
      <div className="space-y-4">
        {chores.map((chore) => {
          const currentRoundLogs = chore.logs.filter(
            (l) => l.round === chore.currentRound
          );
          const completedIds = new Set(
            currentRoundLogs.map((l) => l.housemateId)
          );
          const progress = completedIds.size;
          const total = housemates.length;
          const isCelebrating = celebrateChore === chore.id;

          return (
            <div
              key={chore.id}
              className={
                "bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden transition-all " +
                (isCelebrating
                  ? "ring-2 ring-yellow-400/50 border-yellow-400/30"
                  : "")
              }
            >
              {/* Chore Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-700/30">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{chore.emoji}</span>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      {chore.name}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Lượt {chore.currentRound} · {progress}/{total} đã xong
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-3">
                  {isCelebrating && (
                    <span className="text-sm text-yellow-400 animate-bounce">
                      🎉 Hoàn thành!
                    </span>
                  )}
                  <div className="w-24 h-2 bg-slate-700/50 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: (progress / total) * 100 + "%",
                        background:
                          progress === total
                            ? "linear-gradient(90deg, #22c55e, #10b981)"
                            : "linear-gradient(90deg, #6366f1, #8b5cf6)",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 4 Marks Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-x divide-y sm:divide-y-0 divide-slate-700/30">
                {housemates.map((hm) => {
                  const isCompleted = completedIds.has(hm.id);
                  const logEntry = currentRoundLogs.find(
                    (l) => l.housemateId === hm.id
                  );
                  const isLoading =
                    processing === chore.id + "-" + hm.id;

                  return (
                    <button
                      key={hm.id}
                      onClick={() =>
                        isCompleted && logEntry
                          ? handleUndo(chore.id, hm.id, chore.currentRound)
                          : handleComplete(chore.id, hm.id)
                      }
                      disabled={isLoading}
                      className={
                        "relative flex flex-col items-center gap-2 py-5 px-3 transition-all group select-none touch-manipulation " +
                        (isCompleted
                          ? "bg-opacity-10"
                          : "hover:bg-slate-700/30")
                      }
                      style={
                        isCompleted
                          ? { backgroundColor: hm.color + "12" }
                          : undefined
                      }
                    >
                      {/* Emoji Mark */}
                      <div
                        className={
                          "relative w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all " +
                          (isCompleted
                            ? "scale-110 shadow-lg"
                            : "opacity-40 grayscale group-hover:opacity-70 group-hover:grayscale-0")
                        }
                        style={
                          isCompleted
                            ? {
                                backgroundColor: hm.color + "25",
                                boxShadow: "0 4px 15px " + hm.color + "30",
                              }
                            : { backgroundColor: "rgba(100,116,139,0.15)" }
                          }
                      >
                        {isLoading ? (
                          <div
                            className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
                            style={{ borderColor: hm.color + "60", borderTopColor: "transparent" }}
                          />
                        ) : (
                          <span>{hm.emoji}</span>
                        )}

                        {/* Check badge */}
                        {isCompleted && !isLoading && (
                          <div
                            className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs"
                            style={{ backgroundColor: hm.color }}
                          >
                            ✓
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <span
                        className={
                          "text-xs font-medium transition-colors " +
                          (isCompleted ? "" : "text-slate-500")
                        }
                        style={isCompleted ? { color: hm.color } : undefined}
                      >
                        {hm.name}
                      </span>

                      {/* Timestamp */}
                      {isCompleted && logEntry && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(logEntry.completedAt).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </span>
                      )}

                      {/* Hover hint */}
                      {!isCompleted && !isLoading && (
                        <span className="text-[10px] text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          Nhấn để chấm
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
