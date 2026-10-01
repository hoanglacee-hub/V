"use client";

import { useState, useEffect, useCallback } from "react";

interface Housemate {
  id: string;
  name: string;
  emoji: string;
  color: string;
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

export default function LichSuPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [housemates, setHousemates] = useState<Housemate[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Thống kê tổng số lần mỗi người làm mỗi công việc
  const getPersonStats = () => {
    const stats: Record<string, Record<string, number>> = {};

    for (const hm of housemates) {
      stats[hm.id] = {};
      for (const chore of chores) {
        stats[hm.id][chore.id] = chore.logs.filter(
          (l) => l.housemateId === hm.id
        ).length;
      }
    }

    return stats;
  };

  const personStats = getPersonStats();

  // Tổng số lần làm việc mỗi người
  const getTotalForPerson = (hmId: string) => {
    return Object.values(personStats[hmId] || {}).reduce((a, b) => a + b, 0);
  };

  // Lịch sử gần đây (tất cả chores)
  const allLogs = chores
    .flatMap((c) =>
      c.logs.map((l) => ({
        ...l,
        choreName: c.name,
        choreEmoji: c.emoji,
      }))
    )
    .sort(
      (a, b) =>
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">📊 Lịch Sử & Thống Kê</h1>
        <p className="text-slate-400 mt-1">
          Xem ai đã làm gì, bao nhiêu lần
        </p>
      </div>

      {/* Leaderboard / Tổng quan */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {housemates
          .sort((a, b) => getTotalForPerson(b.id) - getTotalForPerson(a.id))
          .map((hm, rank) => {
            const total = getTotalForPerson(hm.id);
            return (
              <div
                key={hm.id}
                className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-4 text-center relative overflow-hidden"
              >
                {rank === 0 && total > 0 && (
                  <div className="absolute top-2 right-2 text-xl">👑</div>
                )}
                <div
                  className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center text-2xl mb-2"
                  style={{
                    backgroundColor: hm.color + "25",
                    boxShadow: "0 4px 15px " + hm.color + "20",
                  }}
                >
                  {hm.emoji}
                </div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: hm.color }}
                >
                  {hm.name}
                </p>
                <p className="text-2xl font-bold text-white">{total}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                  lần hoàn thành
                </p>
              </div>
            );
          })}
      </div>

      {/* Thống kê chi tiết theo công việc */}
      {chores.length > 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-slate-700/30">
            <h2 className="text-base font-semibold text-white">
              Chi tiết theo công việc
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-700/30">
                  <th className="px-4 py-3 text-left">Công việc</th>
                  {housemates.map((hm) => (
                    <th key={hm.id} className="px-4 py-3 text-center">
                      <span className="text-lg">{hm.emoji}</span>
                      <br />
                      <span style={{ color: hm.color }}>{hm.name}</span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-center">Lượt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {chores.map((chore) => (
                  <tr
                    key={chore.id}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="mr-2">{chore.emoji}</span>
                      <span className="text-white font-medium">
                        {chore.name}
                      </span>
                    </td>
                    {housemates.map((hm) => {
                      const count = personStats[hm.id]?.[chore.id] || 0;
                      return (
                        <td
                          key={hm.id}
                          className="px-4 py-3 text-center font-bold"
                          style={{ color: count > 0 ? hm.color : undefined }}
                        >
                          <span
                            className={count === 0 ? "text-slate-600" : ""}
                          >
                            {count}
                          </span>
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center text-slate-400">
                      {chore.currentRound}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lịch sử gần đây */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-4 border-b border-slate-700/30">
          <h2 className="text-base font-semibold text-white">
            Hoạt động gần đây
          </h2>
        </div>
        {allLogs.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            Chưa có hoạt động nào
          </div>
        ) : (
          <div className="divide-y divide-slate-700/30 max-h-96 overflow-y-auto">
            {allLogs.slice(0, 50).map((log) => (
              <div
                key={log.id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-slate-700/20 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    backgroundColor: log.housemate.color + "20",
                  }}
                >
                  {log.housemate.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white">
                    <span
                      className="font-medium"
                      style={{ color: log.housemate.color }}
                    >
                      {log.housemate.name}
                    </span>{" "}
                    đã hoàn thành{" "}
                    <span className="text-slate-300">
                      {log.choreEmoji} {log.choreName}
                    </span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Lượt {log.round} ·{" "}
                    {new Date(log.completedAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
