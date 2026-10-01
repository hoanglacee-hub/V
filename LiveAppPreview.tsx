"use client";

import React, { useState, useMemo } from "react";
import {
  Play,
  RotateCcw,
  Download,
  Filter,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  Award,
  Zap,
  Plus,
  Trash2,
  Code2,
  FileJson,
  BarChart3,
  Sliders,
  Check,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { downloadSingleFile, downloadProjectZip } from "@/lib/artifactParser";

export type CognitiveDifficulty = "EASY" | "MEDIUM" | "HARD" | "EXPERT";

export interface LiveQuestionItem {
  id: string;
  code: string;
  subject: string;
  content: string;
  options: string[];
  correctAnswer: string;
  difficulty: CognitiveDifficulty;
  difficultyScore: number;
  bloomTaxonomyLevel: "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao";
  estimatedTimeSeconds: number;
  tags: string[];
  explanation: string;
}

const DEFAULT_QUESTIONS: LiveQuestionItem[] = [
  {
    id: "q1",
    code: "TOAN-01",
    subject: "Toán học",
    content: "Định nghĩa hàm số f(x) liên tục tại điểm x0 và điều kiện cần là gì?",
    options: [
      "A. Giới hạn f(x) khi x tiến tới x0 tồn tại",
      "B. f(x0) phải xác định",
      "C. lim f(x) = f(x0) khi x -> x0",
      "D. Cả 3 điều kiện trên đều đúng",
    ],
    correctAnswer: "D",
    difficulty: "EASY",
    difficultyScore: 25,
    bloomTaxonomyLevel: "Nhận biết",
    estimatedTimeSeconds: 60,
    tags: ["Giải tích", "Hàm số", "Lý thuyết"],
    explanation:
      "Theo định nghĩa SGK Giải tích: Hàm số f liên tục tại x0 khi và chỉ khi x0 thuộc TXĐ, tồn tại giới hạn hữu hạn của f(x) khi x -> x0 và giới hạn đó bằng f(x0).",
  },
  {
    id: "q2",
    code: "TOAN-02",
    subject: "Toán học",
    content: "Tính tích phân bất định I = ∫ x · e^(2x) dx bằng phương pháp nguyên hàm từng phần.",
    options: [
      "A. (2x - 1)e^(2x) / 4 + C",
      "B. x · e^(2x) / 2 + C",
      "C. (x - 1)e^(2x) / 2 + C",
      "D. e^(2x) / 4 + C",
    ],
    correctAnswer: "A",
    difficulty: "MEDIUM",
    difficultyScore: 52,
    bloomTaxonomyLevel: "Thông hiểu",
    estimatedTimeSeconds: 150,
    tags: ["Tích phân", "Nguyên hàm", "Tính toán"],
    explanation:
      "Đặt u = x => du = dx; dv = e^(2x)dx => v = (1/2)e^(2x). Khi đó I = (x/2)e^(2x) - (1/2)∫e^(2x)dx = (2x - 1)e^(2x)/4 + C.",
  },
  {
    id: "q3",
    code: "TOAN-03",
    subject: "Toán học",
    content: "Cho hàm số f(x) = x³ - 3mx² + 3(m² - 1)x - (m³ - 3m). Tìm m để đồ thị hàm số có 2 điểm cực trị nằm về hai phía của trục hoành.",
    options: [
      "A. -1 < m < 1",
      "B. m > 1 hoặc m < -1",
      "C. Không tồn tại m thỏa mãn",
      "D. Mọi m thuộc R",
    ],
    correctAnswer: "A",
    difficulty: "HARD",
    difficultyScore: 78,
    bloomTaxonomyLevel: "Vận dụng",
    estimatedTimeSeconds: 240,
    tags: ["Cực trị", "Tham số m", "Giải tích 12"],
    explanation:
      "f'(x) = 3x² - 6mx + 3(m² - 1). Để có 2 cực trị nằm về 2 phía Ox thì yCĐ · yCT < 0. Giải bất phương trình ta được -1 < m < 1.",
  },
  {
    id: "q4",
    code: "TOAN-04",
    subject: "Toán học",
    content: "Biện luận số nghiệm của phương trình vi phân phi tuyến bậc hai y'' + sin(y) = 0 và xác định không gian pha để quỹ đạo chuyển động là tuần hoàn kín (chu trình giới hạn).",
    options: [
      "A. Năng lượng E < 1 quanh điểm yên ngựa",
      "B. Điểm cân bằng Lyapunov ổn định tiệm cận",
      "C. Quỹ đạo đóng trong lân cận gốc O với mức năng lượng E = (1/2)y'² - cos(y) < 1",
      "D. Phương trình hỗn loạn không tồn tại chu trình kín",
    ],
    correctAnswer: "C",
    difficulty: "EXPERT",
    difficultyScore: 94,
    bloomTaxonomyLevel: "Vận dụng cao",
    estimatedTimeSeconds: 360,
    tags: ["Phương trình vi phân", "Hệ phi tuyến", "Không gian pha"],
    explanation:
      "Mô hình con lắc đơn phi tuyến bảo toàn tích phân năng lượng H(y, y') = y'²/2 - cos(y) = C. Với -1 < C < 1, các đường mức năng lượng là đường cong trơn khép kín quanh gốc (0,0).",
  },
];

const ADVANCED_KEYWORDS = [
  "chứng minh",
  "phân tích",
  "biện luận",
  "tối ưu",
  "đánh giá",
  "tìm cực trị",
  "vi phân",
  "tích phân",
  "phi tuyến",
  "không gian pha",
  "lyapunov",
  "chu trình",
  "hệ số",
  "ma trận",
];

const MEDIUM_KEYWORDS = [
  "tính toán",
  "giải thích",
  "so sánh",
  "áp dụng",
  "chuyển đổi",
  "xác định",
  "nguyên hàm",
  "tham số",
  "nghiệm",
];

interface LiveAppPreviewProps {
  taskGoal?: string;
  fullArtifactContent?: string;
}

export function LiveAppPreview({
  taskGoal = "App phân loại đề thi theo mức độ khó",
  fullArtifactContent = "",
}: LiveAppPreviewProps) {
  // App state
  const [questions, setQuestions] = useState<LiveQuestionItem[]>(DEFAULT_QUESTIONS);
  const [selectedDifficulty, setSelectedDifficulty] = useState<CognitiveDifficulty | "ALL">("ALL");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});

  // Active view inside Live Runner
  const [activeSubTab, setActiveSubTab] = useState<"app" | "lab" | "json">("app");

  // Algorithm Lab state
  const [testContent, setTestContent] = useState(
    "Tính tích phân bất định I = ∫ (2x + 1) / (x² + 4x + 5) dx và biện luận điều kiện hội tụ."
  );
  const [labResult, setLabResult] = useState<{
    score: number;
    difficulty: CognitiveDifficulty;
    bloomLevel: "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao";
    detectedKeywords: string[];
    estimatedTime: number;
  } | null>(null);

  // Run difficulty calculation on testContent
  const handleRunAlgorithm = () => {
    const text = testContent.toLowerCase();
    const detectedKw: string[] = [];
    let kwScore = 0;

    ADVANCED_KEYWORDS.forEach((kw) => {
      if (text.includes(kw)) {
        detectedKw.push(kw);
        kwScore += 18;
      }
    });

    MEDIUM_KEYWORDS.forEach((kw) => {
      if (text.includes(kw)) {
        detectedKw.push(kw);
        kwScore += 10;
      }
    });

    const lengthScore = Math.min(Math.floor(testContent.length / 15), 30);
    const totalScore = Math.min(Math.max(kwScore + lengthScore + 15, 10), 100);

    let diff: CognitiveDifficulty = "EASY";
    let bloom: "Nhận biết" | "Thông hiểu" | "Vận dụng" | "Vận dụng cao" = "Nhận biết";
    let estTime = 60;

    if (totalScore >= 75) {
      diff = "EXPERT";
      bloom = "Vận dụng cao";
      estTime = 300;
    } else if (totalScore >= 50) {
      diff = "HARD";
      bloom = "Vận dụng";
      estTime = 200;
    } else if (totalScore >= 30) {
      diff = "MEDIUM";
      bloom = "Thông hiểu";
      estTime = 120;
    } else {
      diff = "EASY";
      bloom = "Nhận biết";
      estTime = 60;
    }

    setLabResult({
      score: totalScore,
      difficulty: diff,
      bloomLevel: bloom,
      detectedKeywords: detectedKw,
      estimatedTime: estTime,
    });
  };

  // Add lab item to active question bank
  const handleAddLabQuestion = () => {
    if (!labResult || !testContent.trim()) return;

    const newQ: LiveQuestionItem = {
      id: `q_${Date.now()}`,
      code: `TEST-${questions.length + 1}`,
      subject: "Toán học",
      content: testContent.trim(),
      options: [
        "A. Đáp án phân tích thứ nhất",
        "B. Đáp án phân tích thứ hai (Chính xác)",
        "C. Đáp án phân tích thứ ba",
        "D. Đáp án phân tích thứ tư",
      ],
      correctAnswer: "B",
      difficulty: labResult.difficulty,
      difficultyScore: labResult.score,
      bloomTaxonomyLevel: labResult.bloomLevel,
      estimatedTimeSeconds: labResult.estimatedTime,
      tags: ["Kiểm thử trực tiếp", ...labResult.detectedKeywords],
      explanation: `Câu hỏi được phân loại tự động bởi DifficultyEngine với độ khó ${labResult.score}/100. Từ khóa nhận diện: ${labResult.detectedKeywords.join(", ") || "Không có"}.`,
    };

    setQuestions((prev) => [newQ, ...prev]);
    setActiveSubTab("app");
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) return false;
      if (searchKeyword.trim()) {
        const kw = searchKeyword.toLowerCase();
        const matchContent = q.content.toLowerCase().includes(kw);
        const matchSubject = q.subject.toLowerCase().includes(kw);
        const matchTags = q.tags.some((t) => t.toLowerCase().includes(kw));
        const matchCode = q.code.toLowerCase().includes(kw);
        if (!matchContent && !matchSubject && !matchTags && !matchCode) return false;
      }
      return true;
    });
  }, [questions, selectedDifficulty, searchKeyword]);

  // Bloom taxonomy statistics
  const stats = useMemo(() => {
    const total = questions.length;
    if (total === 0) return { easy: 0, medium: 0, hard: 0, expert: 0, avgScore: 0 };

    const easyCount = questions.filter((q) => q.difficulty === "EASY").length;
    const medCount = questions.filter((q) => q.difficulty === "MEDIUM").length;
    const hardCount = questions.filter((q) => q.difficulty === "HARD").length;
    const expCount = questions.filter((q) => q.difficulty === "EXPERT").length;
    const avg = Math.round(questions.reduce((acc, q) => acc + q.difficultyScore, 0) / total);

    return {
      easy: Math.round((easyCount / total) * 100),
      medium: Math.round((medCount / total) * 100),
      hard: Math.round((hardCount / total) * 100),
      expert: Math.round((expCount / total) * 100),
      avgScore: avg,
      total,
    };
  }, [questions]);

  // Export questions to JSON
  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(questions, null, 2);
    downloadSingleFile(`exam-questions-${Date.now()}.json`, jsonStr);
  };

  const handleDownloadZip = () => {
    downloadProjectZip(taskGoal, fullArtifactContent);
  };

  const getDifficultyColor = (diff: CognitiveDifficulty) => {
    switch (diff) {
      case "EASY":
        return {
          bg: "bg-emerald-950/60 text-emerald-300 border-emerald-500/40",
          pill: "bg-emerald-500",
        };
      case "MEDIUM":
        return {
          bg: "bg-blue-950/60 text-blue-300 border-blue-500/40",
          pill: "bg-blue-500",
        };
      case "HARD":
        return {
          bg: "bg-amber-950/60 text-amber-300 border-amber-500/40",
          pill: "bg-amber-500",
        };
      case "EXPERT":
        return {
          bg: "bg-rose-950/60 text-rose-300 border-rose-500/40",
          pill: "bg-rose-500",
        };
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#06110d] rounded-2xl border border-[#133326] overflow-hidden shadow-2xl">
      {/* Top Runner Bar */}
      <div className="px-5 py-3.5 bg-[#0b1a14] border-b border-[#133326] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Môi trường thực thi trực tiếp (Live Sandbox)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 p-1 bg-[#06110d] border border-[#133326] rounded-xl text-xs">
            <button
              onClick={() => setActiveSubTab("app")}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer ${
                activeSubTab === "app"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Ứng dụng lọc đề thi
            </button>
            <button
              onClick={() => {
                setActiveSubTab("lab");
                if (!labResult) handleRunAlgorithm();
              }}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "lab"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Lab định lượng độ khó</span>
            </button>
            <button
              onClick={() => setActiveSubTab("json")}
              className={`px-3 py-1 rounded-lg font-medium transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === "json"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileJson className="w-3.5 h-3.5 text-emerald-400" />
              <span>Dữ liệu JSON</span>
            </button>
          </div>
        </div>

        {/* Global Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#133326] hover:bg-[#1a4433] text-emerald-300 hover:text-emerald-200 text-xs font-medium border border-emerald-500/30 transition cursor-pointer"
            title="Xuất danh sách câu hỏi ra file JSON"
          >
            <FileJson className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Xuất JSON</span>
          </button>

          <button
            onClick={handleDownloadZip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md shadow-emerald-950/60 transition cursor-pointer"
            title="Tải toàn bộ dự án gồm mã nguồn, thuật toán và tài liệu kỹ thuật về máy"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Tải trọn bộ (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* SUBTAB 1: LIVE APPLICATION (EXAM CLASSIFIER APP) */}
        {activeSubTab === "app" && (
          <div className="space-y-5 max-w-5xl mx-auto">
            {/* Header & Stats Card */}
            <div className="p-4 rounded-2xl bg-[#0b1a14] border border-[#133326] space-y-4 shadow-lg">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <span>Hệ Thống Phân Loại & Lọc Đề Thi Thông Minh</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Định lượng mức độ nhận thức theo Bloom và phân tầng câu hỏi tự động.
                  </p>
                </div>

                <button
                  onClick={() => setQuestions(DEFAULT_QUESTIONS)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#06110d] hover:bg-emerald-950/40 text-slate-400 hover:text-emerald-300 border border-[#133326] text-xs transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Khôi phục mẫu</span>
                </button>
              </div>

              {/* Bloom Distribution Bars */}
              <div className="space-y-2 pt-2 border-t border-[#133326]/60">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-300">
                    Phân bố tỷ lệ Bloom (Tổng số: {stats.total} câu hỏi)
                  </span>
                  <span className="text-emerald-400 font-mono">
                    Điểm độ khó trung bình: {stats.avgScore}/100
                  </span>
                </div>

                {/* Multi-segment Progress Bar */}
                <div className="w-full h-3 rounded-full bg-[#06110d] overflow-hidden flex border border-[#133326]">
                  <div
                    style={{ width: `${stats.easy}%` }}
                    className="bg-emerald-500 transition-all duration-500"
                    title={`Nhận biết: ${stats.easy}%`}
                  />
                  <div
                    style={{ width: `${stats.medium}%` }}
                    className="bg-blue-500 transition-all duration-500"
                    title={`Thông hiểu: ${stats.medium}%`}
                  />
                  <div
                    style={{ width: `${stats.hard}%` }}
                    className="bg-amber-500 transition-all duration-500"
                    title={`Vận dụng: ${stats.hard}%`}
                  />
                  <div
                    style={{ width: `${stats.expert}%` }}
                    className="bg-rose-500 transition-all duration-500"
                    title={`Vận dụng cao: ${stats.expert}%`}
                  />
                </div>

                {/* Legend Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Nhận biết ({stats.easy}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>Thông hiểu ({stats.medium}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Vận dụng ({stats.hard}%)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Vận dụng cao ({stats.expert}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-[#0b1a14] border border-[#133326]">
              {/* Filter chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium mr-1 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Bộ lọc:</span>
                </span>
                {(
                  [
                    { id: "ALL", label: "Tất cả" },
                    { id: "EASY", label: "Nhận biết" },
                    { id: "MEDIUM", label: "Thông hiểu" },
                    { id: "HARD", label: "Vận dụng" },
                    { id: "EXPERT", label: "Vận dụng cao" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setSelectedDifficulty(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selectedDifficulty === f.id
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-[#06110d] text-slate-400 hover:text-slate-200 border border-[#133326]"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm câu hỏi, chuyên đề..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-[#06110d] border border-[#133326] text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Question Cards List */}
            <div className="space-y-3.5">
              {filteredQuestions.length === 0 ? (
                <div className="p-10 text-center rounded-2xl bg-[#0b1a14] border border-[#133326] text-slate-400">
                  <HelpCircle className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-300">
                    Không tìm thấy câu hỏi phù hợp
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Hãy thử thay đổi mức độ khó hoặc từ khóa tìm kiếm.
                  </p>
                </div>
              ) : (
                filteredQuestions.map((q) => {
                  const colors = getDifficultyColor(q.difficulty);
                  const isSolutionOpen = expandedSolutions[q.id];
                  const userAnswer = userAnswers[q.id];

                  return (
                    <div
                      key={q.id}
                      className="p-5 rounded-2xl bg-[#0b1a14] border border-[#133326] hover:border-emerald-500/40 transition shadow-md space-y-4"
                    >
                      {/* Card Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-[#06110d] border border-[#133326] text-xs font-mono font-bold text-emerald-400">
                            {q.code}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">{q.subject}</span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${colors.bg}`}
                          >
                            {q.bloomTaxonomyLevel} ({q.difficultyScore}/100)
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <div className="flex items-center gap-1 text-slate-400 font-mono">
                            <Clock className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{q.estimatedTimeSeconds}s</span>
                          </div>
                          <button
                            onClick={() =>
                              setQuestions((prev) => prev.filter((item) => item.id !== q.id))
                            }
                            className="text-slate-500 hover:text-rose-400 transition cursor-pointer p-1"
                            title="Xóa câu hỏi này"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <p className="text-sm text-slate-200 font-medium leading-relaxed">
                        {q.content}
                      </p>

                      {/* Options */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, idx) => {
                          const optKey = opt.charAt(0);
                          const isSelected = userAnswer === optKey;
                          const isCorrect = q.correctAnswer === optKey;

                          let btnStyle = "bg-[#06110d] border-[#133326] text-slate-300 hover:border-emerald-500/50";
                          if (isSelected) {
                            btnStyle = isCorrect
                              ? "bg-emerald-950/80 border-emerald-500 text-emerald-200"
                              : "bg-rose-950/80 border-rose-500 text-rose-200";
                          }

                          return (
                            <button
                              key={idx}
                              onClick={() =>
                                setUserAnswers((prev) => ({ ...prev, [q.id]: optKey }))
                              }
                              className={`p-2.5 rounded-xl border text-xs text-left transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isSelected &&
                                (isCorrect ? (
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                ))}
                            </button>
                          );
                        })}
                      </div>

                      {/* Card Footer: Tags & Solution toggle */}
                      <div className="pt-2 border-t border-[#133326]/60 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-1.5">
                          {q.tags.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#06110d] text-slate-400 text-[10px] font-medium border border-[#133326]"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() =>
                            setExpandedSolutions((prev) => ({
                              ...prev,
                              [q.id]: !isSolutionOpen,
                            }))
                          }
                          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition cursor-pointer"
                        >
                          <span>{isSolutionOpen ? "Ẩn giải thích" : "Xem lời giải & cơ chế"}</span>
                          {isSolutionOpen ? (
                            <ChevronUp className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>

                      {/* Expanded Solution */}
                      {isSolutionOpen && (
                        <div className="p-3.5 rounded-xl bg-[#06110d] border border-emerald-900/40 text-xs text-emerald-200/90 space-y-1.5 leading-relaxed">
                          <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Đáp án đúng: {q.correctAnswer}</span>
                          </div>
                          <p>{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 2: ALGORITHM LAB (TEST ENGINE LIVE) */}
        {activeSubTab === "lab" && (
          <div className="space-y-5 max-w-4xl mx-auto">
            <div className="p-5 rounded-2xl bg-[#0b1a14] border border-[#133326] space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span>Phòng Thử Nghiệm Thuật Toán Định Lượng Độ Khó</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Kiểm thử thuật toán tính điểm độ khó đa biến trực tiếp với văn bản câu hỏi tự do.
                  </p>
                </div>
              </div>

              {/* Formula Card */}
              <div className="p-3.5 rounded-xl bg-[#06110d] border border-[#133326] text-xs font-mono text-emerald-300 leading-relaxed">
                <span className="text-slate-400 font-sans block mb-1">
                  Công thức định lượng toán học đang chạy:
                </span>
                $$S = 0.35 \cdot K_w + 0.35 \cdot C_t + 0.30 \cdot B_l$$
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  • $K_w$: Trọng số từ khóa nhận thức (chứng minh, vi phân, cực trị,...) <br />
                  • $C_t$: Tỷ số độ dài và độ phức tạp cấu trúc <br />
                  • Thang điểm quy đổi Bloom: 0-29 (Nhận biết), 30-49 (Thông hiểu), 50-74 (Vận dụng), 75-100 (Vận dụng cao).
                </div>
              </div>

              {/* Input Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">
                  Nhập nội dung câu hỏi để kiểm định:
                </label>
                <textarea
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  rows={4}
                  className="w-full p-3.5 rounded-xl bg-[#06110d] border border-[#133326] text-xs text-slate-200 font-sans focus:outline-none focus:border-emerald-500 leading-relaxed"
                  placeholder="Nhập hoặc dán nội dung câu hỏi tại đây..."
                />

                {/* Quick Preset Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="text-slate-500 text-[11px]">Mẫu thử:</span>
                  <button
                    onClick={() =>
                      setTestContent(
                        "Định nghĩa hàm số đồng biến trên khoảng (a; b) và điều kiện đạo hàm cấp một?"
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#06110d] text-slate-300 hover:text-emerald-300 border border-[#133326] text-[11px] transition cursor-pointer"
                  >
                    Lý thuyết cơ bản
                  </button>
                  <button
                    onClick={() =>
                      setTestContent(
                        "Tính tích phân bất định I = ∫ (x³ + 2x) · ln(x) dx bằng phương pháp từng phần."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#06110d] text-slate-300 hover:text-emerald-300 border border-[#133326] text-[11px] transition cursor-pointer"
                  >
                    Tích phân từng phần
                  </button>
                  <button
                    onClick={() =>
                      setTestContent(
                        "Biện luận số nghiệm của hệ phương trình vi phân phi tuyến bậc hai và chứng minh sự tồn tại của chu trình giới hạn Lyapunov."
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-[#06110d] text-slate-300 hover:text-emerald-300 border border-[#133326] text-[11px] transition cursor-pointer"
                  >
                    Vi phân phi tuyến (Vận dụng cao)
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleRunAlgorithm}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/50 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>⚡ Chạy Thuật Toán Định Lượng</span>
                </button>
              </div>

              {/* Lab Result Card */}
              {labResult && (
                <div className="p-4 rounded-xl bg-[#06110d] border border-emerald-500/40 space-y-3 mt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#133326]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-semibold">Kết quả phân loại:</span>
                      <span className="text-sm font-bold text-emerald-300 font-mono">
                        {labResult.bloomLevel} (Cấp độ: {labResult.difficulty})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Điểm số định lượng:</span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-950 text-emerald-300 font-mono font-bold text-xs border border-emerald-500/40">
                        {labResult.score}/100
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    <div>
                      <span className="text-slate-400">Từ khóa nhận diện được:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {labResult.detectedKeywords.length > 0 ? (
                          labResult.detectedKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 text-[11px]"
                            >
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">
                            Không phát hiện từ khóa chuyên sâu (Thuộc dạng cơ bản)
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400">Thời gian làm bài ước tính:</span>
                      <p className="font-mono text-emerald-400 font-semibold mt-1">
                        ~{labResult.estimatedTime} giây ({Math.round(labResult.estimatedTime / 60)} phút)
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleAddLabQuestion}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#133326] hover:bg-emerald-900 text-emerald-300 hover:text-white text-xs font-semibold border border-emerald-500/30 transition cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm câu này vào ứng dụng đề thi</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SUBTAB 3: RAW JSON STATE */}
        {activeSubTab === "json" && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-[#0b1a14] border border-[#133326] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <FileJson className="w-4 h-4 text-emerald-400" />
                  <span>Dữ liệu kho câu hỏi JSON đang nạp trong bộ nhớ:</span>
                </span>
                <button
                  onClick={handleExportJSON}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition cursor-pointer"
                >
                  Tải tệp JSON
                </button>
              </div>

              <pre className="p-4 rounded-xl bg-[#06110d] border border-[#133326] overflow-x-auto text-xs font-mono text-emerald-300 max-h-[480px]">
                {JSON.stringify(questions, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
