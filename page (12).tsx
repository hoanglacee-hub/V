"use client";

import { useState, useEffect } from "react";

interface Chore {
  id: string;
  name: string;
  emoji: string;
  currentRound: number;
  isActive: boolean;
}

const CHORE_EMOJIS = [
  "💧", "🧹", "🧽", "🍳", "🛒", "🗑️",
  "🧺", "🚿", "🪣", "🧴", "🍽️", "📦",
  "🧊", "⚡", "🪴", "🐕", "📋", "🔧",
];

const SUGGESTED_CHORES = [
  { name: "Lấy nước", emoji: "💧" },
  { name: "Quét nhà", emoji: "🧹" },
  { name: "Rửa chén", emoji: "🍽️" },
  { name: "Đổ rác", emoji: "🗑️" },
  { name: "Giặt đồ", emoji: "🧺" },
  { name: "Lau nhà", emoji: "🧽" },
  { name: "Nấu cơm", emoji: "🍳" },
  { name: "Đi chợ", emoji: "🛒" },
];

export default function CongViecPage() {
  const [chores, setChores] = useState<Chore[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmoji, setNewEmoji] = useState("📋");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadChores();
  }, []);

  const loadChores = async () => {
    try {
      const res = await fetch("/api/cham-cong/chores");
      setChores(await res.json());
    } catch {
      console.error("Lỗi tải công việc");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) {
      alert("Vui lòng nhập tên công việc!");
      return;
    }
    setSaving(true);
    try {
      const url = editingId
        ? "/api/cham-cong/chores/" + editingId
        : "/api/cham-cong/chores";

      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, emoji: newEmoji }),
      });

      if (res.ok) {
        setNewName("");
        setNewEmoji("📋");
        setShowForm(false);
        setEditingId(null);
        await loadChores();
      }
    } catch {
      alert("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm('Xóa công việc "' + name + '"? Lịch sử sẽ bị xóa.'))
      return;
    try {
      await fetch("/api/cham-cong/chores/" + id, { method: "DELETE" });
      await loadChores();
    } catch {
      alert("Có lỗi xảy ra");
    }
  };

  const handleEdit = (chore: Chore) => {
    setNewName(chore.name);
    setNewEmoji(chore.emoji);
    setEditingId(chore.id);
    setShowForm(true);
  };

  const handleQuickAdd = async (name: string, emoji: string) => {
    setSaving(true);
    try {
      await fetch("/api/cham-cong/chores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji }),
      });
      await loadChores();
    } catch {
      alert("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">✏️ Quản Lý Công Việc</h1>
          <p className="text-slate-400 mt-1">
            Thêm, sửa, xóa các đầu việc nhà
          </p>
        </div>
        <button
          onClick={() => {
            setNewName("");
            setNewEmoji("📋");
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          <span className="text-lg">+</span> Thêm mới
        </button>
      </div>

      {/* Quick Add Suggestions */}
      {chores.length === 0 && (
        <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5">
          <p className="text-sm text-slate-400 mb-3">⚡ Thêm nhanh:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_CHORES.map((sc) => (
              <button
                key={sc.name}
                onClick={() => handleQuickAdd(sc.name, sc.emoji)}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-sm text-slate-300 hover:bg-slate-700/80 hover:text-white transition-all disabled:opacity-50"
              >
                <span>{sc.emoji}</span>
                <span>{sc.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chore List */}
      {chores.length > 0 && (
        <div className="space-y-2">
          {chores.map((chore) => (
            <div
              key={chore.id}
              className="flex items-center justify-between bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 group hover:bg-slate-800/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{chore.emoji}</span>
                <div>
                  <p className="text-sm font-medium text-white">{chore.name}</p>
                  <p className="text-xs text-slate-500">
                    Đang ở lượt {chore.currentRound}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(chore)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-blue-400 transition-colors"
                  title="Sửa"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(chore.id, chore.name)}
                  className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-red-400 transition-colors"
                  title="Xóa"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-white">
                {editingId ? "Sửa công việc" : "Thêm công việc mới"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Tên công việc <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="VD: Lấy nước, Quét nhà..."
                  className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                />
              </div>

              {/* Emoji */}
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  Biểu tượng
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {CHORE_EMOJIS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setNewEmoji(em)}
                      className={
                        "w-10 h-10 rounded-lg text-lg flex items-center justify-center hover:bg-slate-700/60 transition-colors " +
                        (newEmoji === em
                          ? "bg-indigo-500/30 ring-2 ring-indigo-400"
                          : "bg-slate-900/40")
                      }
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white rounded-xl hover:bg-slate-700/50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAdd}
                  disabled={saving || !newName.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {editingId ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
