"use client";

import { useState, useEffect } from "react";

interface Housemate {
  id: string;
  name: string;
  emoji: string;
  color: string;
  order: number;
}

const DEFAULT_MEMBERS = [
  { name: "", emoji: "🔴", color: "#EF4444" },
  { name: "", emoji: "🔵", color: "#3B82F6" },
  { name: "", emoji: "🟢", color: "#22C55E" },
  { name: "", emoji: "🟡", color: "#EAB308" },
];

const EMOJI_OPTIONS = [
  "🔴", "🔵", "🟢", "🟡", "🟠", "🟣",
  "🐱", "🐶", "🐻", "🐼", "🦊", "🐯",
  "🌟", "⚡", "🔥", "💎", "🎯", "🎮",
  "🍎", "🍊", "🍋", "🫐", "🍇", "🥝",
  "😎", "🤗", "😺", "🥳", "🦄", "👻",
];

export default function ThanhVienPage() {
  const [members, setMembers] = useState<Housemate[]>([]);
  const [drafts, setDrafts] = useState<
    { name: string; emoji: string; color: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [pickerIndex, setPickerIndex] = useState<number | null>(null);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      const res = await fetch("/api/cham-cong/housemates");
      const data = await res.json();
      setMembers(data);

      if (data.length === 0) {
        setDrafts(DEFAULT_MEMBERS.map((d) => ({ ...d })));
        setIsNew(true);
      } else {
        setDrafts(
          data.map((m: Housemate) => ({
            name: m.name,
            emoji: m.emoji,
            color: m.color,
          }))
        );
        setIsNew(false);
      }
    } catch {
      console.error("Lỗi tải thành viên");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Validate
    for (const d of drafts) {
      if (!d.name.trim()) {
        alert("Vui lòng nhập tên cho tất cả thành viên!");
        return;
      }
    }

    setSaving(true);
    try {
      if (isNew) {
        // Tạo mới từng thành viên
        for (const d of drafts) {
          await fetch("/api/cham-cong/housemates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(d),
          });
        }
      } else {
        // Batch update
        const updates = members.map((m, i) => ({
          id: m.id,
          name: drafts[i].name,
          emoji: drafts[i].emoji,
          color: drafts[i].color,
        }));

        await fetch("/api/cham-cong/housemates", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      }

      await loadMembers();
      alert("Đã lưu thành công! ✅");
    } catch {
      alert("Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  const updateDraft = (
    index: number,
    field: "name" | "emoji" | "color",
    value: string
  ) => {
    setDrafts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
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
      <div>
        <h1 className="text-2xl font-bold text-white">👥 Thành Viên</h1>
        <p className="text-slate-400 mt-1">
          {isNew
            ? "Nhập tên và chọn biểu tượng cho 4 thành viên"
            : "Chỉnh sửa thông tin thành viên"}
        </p>
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {drafts.map((draft, i) => (
          <div
            key={i}
            className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-5 space-y-4"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                style={{
                  backgroundColor: draft.color + "25",
                  boxShadow: "0 4px 15px " + draft.color + "20",
                }}
              >
                {draft.emoji}
              </div>
              <div>
                <p className="text-sm text-slate-400">Thành viên {i + 1}</p>
                <p className="text-white font-semibold">
                  {draft.name || "Chưa đặt tên"}
                </p>
              </div>
            </div>

            {/* Tên */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Tên</label>
              <input
                type="text"
                value={draft.name}
                onChange={(e) => updateDraft(i, "name", e.target.value)}
                placeholder="Nhập tên..."
                className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {/* Emoji Picker */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Biểu tượng (mark)
              </label>
              <button
                onClick={() =>
                  setPickerIndex(pickerIndex === i ? null : i)
                }
                className="px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-lg hover:bg-slate-700/50 transition-colors"
              >
                {draft.emoji} <span className="text-xs text-slate-400 ml-1">Chọn ▾</span>
              </button>

              {pickerIndex === i && (
                <div className="mt-2 p-3 bg-slate-900 border border-slate-700/50 rounded-xl grid grid-cols-6 gap-2">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      onClick={() => {
                        updateDraft(i, "emoji", em);
                        setPickerIndex(null);
                      }}
                      className={
                        "w-9 h-9 rounded-lg text-lg flex items-center justify-center hover:bg-slate-700/60 transition-colors " +
                        (draft.emoji === em
                          ? "bg-indigo-500/30 ring-2 ring-indigo-400"
                          : "")
                      }
                    >
                      {em}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Color */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                Màu sắc
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={draft.color}
                  onChange={(e) => updateDraft(i, "color", e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer bg-transparent"
                />
                <span className="text-xs text-slate-500 font-mono">
                  {draft.color}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Save Button */}
      <div className="flex justify-center pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
        >
          {saving && (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          )}
          {isNew ? "Tạo 4 thành viên" : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  );
}
