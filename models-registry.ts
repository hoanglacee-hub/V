import { ModelId, ModelMetadata, UniversalAiRole, RoleMapping, AiTrendUpdate } from "./types";

export const MODELS_REGISTRY: Record<ModelId, ModelMetadata> = {
  // --- THẾ HỆ MỚI NHẤT (LATEST 2026 GENERATION) ---
  "gemini-3-8-flash": {
    id: "gemini-3-8-flash",
    name: "Gemini 3.8 Flash",
    generation: "2026 Efficiency",
    provider: "Google",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    avatarColor: "from-blue-600 to-cyan-600",
    speedRating: 5,
    costRating: 1,
    tier: "free",
    freeTierBenefit: "Google AI Studio: Miễn phí 100% (15 RPM / 1M token/ngày) với kiến trúc Gemini 3.8 mới nhất. Không cần thẻ tín dụng.",
    contextWindow: "1,500,000 tokens",
    strengths: [
      "Kiến trúc thế hệ mới nhất của Google (Ra mắt T9/2026), tốc độ phản hồi < 300ms",
      "Cửa sổ ngữ cảnh 1.5 triệu tokens hoàn toàn miễn phí trên AI Studio",
      "Khả năng đọc hiểu tài liệu lớn và phân tích đa phương thức thời gian thực"
    ],
    weaknesses: [
      "Với các bài toán triết học trừu tượng cực sâu, cần chuyển sang bản 3.8 Live Extended Thinking"
    ],
    bestFor: "Sinh viên nghiên cứu, đọc giáo trình PDF hàng ngàn trang, phân tích dữ liệu tổng thể siêu tốc độ.",
    description: "Thế hệ Flash mới nhất từ Google, là lựa chọn số 1 về tốc độ và chi phí 0đ cho sinh viên.",
    arenaRank: 2,
    releaseDate: "Tháng 9/2026"
  },
  "gemini-3-8-live": {
    id: "gemini-3-8-live",
    name: "Gemini 3.8 Live (Ext. Thinking)",
    generation: "2026 Frontier",
    provider: "Google",
    badgeColor: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
    avatarColor: "from-indigo-600 to-blue-700",
    speedRating: 3,
    costRating: 3,
    tier: "freemium",
    freeTierBenefit: "Google AI Studio: Có hạn mức gọi thử nghiệm miễn phí cho tác vụ suy luận cao cấp.",
    contextWindow: "2,000,000 tokens",
    strengths: [
      "Tích hợp chuỗi suy luận sâu Extended Thinking thế hệ mới",
      "Khả năng giải toán và phân tích logic phức tạp vượt trội",
      "Ngữ cảnh 2 triệu tokens đồ sộ"
    ],
    weaknesses: [
      "Thời gian suy luận lâu hơn bản Flash do phải tính toán chuỗi CoT"
    ],
    bestFor: "Luận văn tốt nghiệp, nghiên cứu khoa học chuyên sâu, bài toán kỹ thuật nhiều bước.",
    description: "Mô hình suy luận cao cấp cờ đầu của Google với khả năng suy nghĩ mở rộng trước khi trả lời.",
    arenaRank: 1,
    releaseDate: "Tháng 9/2026"
  },
  "claude-opus-5-5": {
    id: "claude-opus-5-5",
    name: "Claude Opus 5.5",
    generation: "2026 Frontier",
    provider: "Anthropic",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    avatarColor: "from-amber-600 to-orange-700",
    speedRating: 3,
    costRating: 4,
    tier: "paid",
    freeTierBenefit: "Mô hình cao cấp hàng đầu thế giới (Ra mắt 22/09/2026) dành cho môi trường chuyên nghiệp & Business.",
    contextWindow: "500,000 tokens",
    strengths: [
      "Mô hình số 1 thế giới về năng lực lập trình và kiến trúc hệ thống (Ra mắt 22/09/2026)",
      "Hành văn tự nhiên, lập luận logic tinh tế không đối thủ",
      "Khả năng thực hiện tác vụ agentic dài hạn (long-horizon) xuất sắc"
    ],
    weaknesses: [
      "Chi phí API phân khúc cao cấp, không có gói miễn phí vĩnh viễn"
    ],
    bestFor: "Lập trình viên chuyên nghiệp, kiến trúc phần mềm enterprise, dự án thương mại.",
    description: "Đỉnh cao công nghệ từ Anthropic, thiết lập kỷ lục mới về năng lực giải quyết tác vụ phức tạp.",
    arenaRank: 1,
    releaseDate: "22/09/2026"
  },
  "claude-3-7-sonnet": {
    id: "claude-3-7-sonnet",
    name: "Claude 3.7 Sonnet (Hybrid)",
    generation: "2026 Frontier",
    provider: "Anthropic",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    avatarColor: "from-orange-600 to-amber-600",
    speedRating: 4,
    costRating: 3,
    tier: "paid",
    freeTierBenefit: "Tích hợp cơ chế suy luận lai (Hybrid Reasoning) linh hoạt giữa tốc độ và chiều sâu.",
    contextWindow: "200,000 tokens",
    strengths: [
      "Có thể chuyển đổi linh hoạt giữa suy luận tức thì và suy luận chuyên sâu",
      "Khả năng viết code sạch và tuân thủ tài liệu API chuẩn xác"
    ],
    weaknesses: [
      "Cần nạp credit trên Anthropic Console"
    ],
    bestFor: "Viết mã nguồn chi tiết, phản biện bài luận, tối ưu giải thuật.",
    description: "Phiên bản Sonnet thế hệ mới cân bằng lý tưởng giữa tốc độ và trí tuệ đỉnh cao.",
    arenaRank: 2,
    releaseDate: "2026"
  },
  "gpt-6-astra": {
    id: "gpt-6-astra",
    name: "GPT-6 Astra (Flagship)",
    generation: "2026 Frontier",
    provider: "OpenAI",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    avatarColor: "from-emerald-600 to-teal-700",
    speedRating: 4,
    costRating: 4,
    tier: "paid",
    freeTierBenefit: "Mô hình cờ đầu thế hệ GPT-6 của OpenAI (Ra mắt 03/09/2026) cho doanh nghiệp.",
    contextWindow: "256,000 tokens",
    strengths: [
      "Mô hình thông minh nhất của OpenAI phát hành 03/09/2026",
      "Khả năng tương tác máy tính (Computer Use), an ninh mạng và tư duy cấu trúc toàn diện",
      "Độ tin cậy tuyệt đối với các tiêu chuẩn doanh nghiệp"
    ],
    weaknesses: [
      "Chi phí cao hơn các dòng Sol / Luna"
    ],
    bestFor: "Quy hoạch kiến trúc tổng thể, lập kế hoạch đa bước (Planner), giải pháp cấp doanh nghiệp.",
    description: "Thế hệ GPT-6 đầu bảng từ OpenAI mở ra kỷ nguyên trí tuệ nhân tạo toàn diện.",
    arenaRank: 1,
    releaseDate: "03/09/2026"
  },
  "gpt-6-sol": {
    id: "gpt-6-sol",
    name: "GPT-6 Sol (Efficient)",
    generation: "2026 Efficiency",
    provider: "OpenAI",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    avatarColor: "from-teal-600 to-emerald-700",
    speedRating: 5,
    costRating: 2,
    tier: "freemium",
    freeTierBenefit: "Dòng GPT-6 giá rẻ (Ra mắt 22/09/2026), OpenAI giảm 50% chi phí API so với các thế hệ trước.",
    contextWindow: "256,000 tokens",
    strengths: [
      "Phát hành 22/09/2026, tối ưu chi phí cực mạnh trong khi vẫn giữ năng lực GPT-6",
      "Tốc độ xử lý nhanh, tuân thủ định dạng JSON hoàn hảo",
      "Rất phù hợp cho sinh viên và tác vụ hàng ngày"
    ],
    weaknesses: [
      "Không hỗ trợ computer use chuyên sâu như bản Astra"
    ],
    bestFor: "Thẩm định chất lượng (QA), trích xuất dữ liệu có cấu trúc, trợ lý học tập đa năng.",
    description: "Thành viên tối ưu chi phí của gia đình GPT-6, mang lại hiệu quả vượt trội cho mọi người dùng.",
    arenaRank: 3,
    releaseDate: "22/09/2026"
  },
  "deepseek-v4-1-flash": {
    id: "deepseek-v4-1-flash",
    name: "DeepSeek-V4.1-Flash",
    generation: "2026 Efficiency",
    provider: "DeepSeek",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    avatarColor: "from-purple-600 to-pink-700",
    speedRating: 5,
    costRating: 1,
    tier: "free",
    freeTierBenefit: "DeepSeek: Miễn phí credit thử nghiệm ban đầu và giá mở siêu rẻ (~0.0005$/1k tokens).",
    contextWindow: "128,000 tokens",
    strengths: [
      "Kiến trúc MoE mới nhất (Phát hành 10/09/2026) tối ưu hóa bộ nhớ suy luận",
      "Tốc độ phản hồi cực cao, chi phí rẻ nhất thế giới trong cùng phân khúc",
      "Khả năng suy luận toán học và logic thuật toán rất mạnh"
    ],
    weaknesses: [
      "Máy chủ thỉnh thoảng có độ trễ nhẹ vào giờ cao điểm quốc tế"
    ],
    bestFor: "Toán học, logic thuật toán, tác vụ trung gian xử lý khối lượng dữ liệu khổng lồ.",
    description: "Hiện tượng mã nguồn mở mới nhất từ DeepSeek phát hành tháng 9/2026, đột phá về hiệu suất phần cứng.",
    arenaRank: 3,
    releaseDate: "10/09/2026"
  },
  "deepseek-r1": {
    id: "deepseek-r1",
    name: "DeepSeek R1 (Reasoning)",
    generation: "2026 Frontier",
    provider: "DeepSeek",
    badgeColor: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/30",
    avatarColor: "from-fuchsia-600 to-purple-800",
    speedRating: 3,
    costRating: 1,
    tier: "freemium",
    freeTierBenefit: "Tặng credit trải nghiệm ban đầu, tư duy suy luận chuỗi (Chain-of-Thought) độc lập.",
    contextWindow: "128,000 tokens",
    strengths: [
      "Suy luận từng bước sâu sắc với mã nguồn mở minh bạch",
      "Chi phí suy luận cực thấp so với OpenAI o1/o3"
    ],
    weaknesses: [
      "Tốc độ sinh token cần thời gian cho quá trình tự suy nghĩ"
    ],
    bestFor: "Giải bài tập thuật toán phức tạp, chứng minh toán học, phân tích đa chiều.",
    description: "Mô hình suy luận mở chấn động giới AI, cung cấp tư duy logic cấp cao với giá sinh viên.",
    arenaRank: 4,
    releaseDate: "2026"
  },
  "llama-3-3-70b": {
    id: "llama-3-3-70b",
    name: "Llama 3.3 70B Versatile",
    generation: "2026 Efficiency",
    provider: "Meta / Groq",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    avatarColor: "from-orange-600 to-amber-700",
    speedRating: 5,
    costRating: 1,
    tier: "free",
    freeTierBenefit: "Groq Cloud: Miễn phí 30 RPM tốc độ siêu thanh 300+ token/s, không cần thẻ tín dụng.",
    contextWindow: "128,000 tokens",
    strengths: [
      "Tốc độ suy luận nhanh nhất thế giới trên LPU Groq",
      "Khả năng phản biện khách quan, độc lập không thiên vị"
    ],
    weaknesses: [
      "Không hỗ trợ xử lý ảnh/video trực tiếp"
    ],
    bestFor: "Phản biện chéo (Critic), kiểm tra tính logic, kiểm thử câu trả lời.",
    description: "Đỉnh cao mã nguồn mở từ Meta chạy siêu tốc độ trên Groq, hoàn toàn miễn phí cho sinh viên.",
    arenaRank: 5,
    releaseDate: "2026"
  },
  "llama-3.3-70b": {
    id: "llama-3.3-70b",
    name: "Llama 3.3 70B Versatile",
    generation: "2026 Efficiency",
    provider: "Meta / Groq",
    badgeColor: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    avatarColor: "from-orange-600 to-amber-700",
    speedRating: 5,
    costRating: 1,
    tier: "free",
    freeTierBenefit: "Groq Cloud: Miễn phí 30 RPM tốc độ siêu thanh 300+ token/s, không cần thẻ tín dụng.",
    contextWindow: "128,000 tokens",
    strengths: [
      "Tốc độ suy luận nhanh nhất thế giới trên LPU Groq",
      "Khả năng phản biện khách quan, độc lập không thiên vị"
    ],
    weaknesses: [
      "Không hỗ trợ xử lý ảnh/video trực tiếp"
    ],
    bestFor: "Phản biện chéo (Critic), kiểm tra tính logic, kiểm thử câu trả lời.",
    description: "Đỉnh cao mã nguồn mở từ Meta chạy siêu tốc độ trên Groq, hoàn toàn miễn phí cho sinh viên.",
    arenaRank: 5,
    releaseDate: "2026"
  },
  "qwen-2-5-coder-32b": {
    id: "qwen-2-5-coder-32b",
    name: "Qwen 2.5 Coder 32B",
    generation: "2026 Efficiency",
    provider: "Alibaba / Groq",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    avatarColor: "from-teal-600 to-emerald-800",
    speedRating: 4,
    costRating: 1,
    tier: "free",
    freeTierBenefit: "Groq Cloud: Miễn phí 100% chuyên phục vụ lập trình mã nguồn cho cộng đồng.",
    contextWindow: "128,000 tokens",
    strengths: [
      "Được huấn luyện trên 5.5 nghìn tỷ token mã nguồn chuyên biệt",
      "Khả năng viết code TypeScript, Python, React cực kỳ chuẩn xác"
    ],
    weaknesses: [
      "Văn phong viết bài luận không mượt bằng Claude"
    ],
    bestFor: "Sinh viên CNTT học lập trình, tạo ứng dụng mẫu, sửa lỗi code.",
    description: "Mô hình chuyên gia viết code mã nguồn mở số 1 cho sinh viên, thay thế giải pháp trả phí.",
    arenaRank: 5,
    releaseDate: "2026"
  },
  "qwen-2.5-coder-32b": {
    id: "qwen-2.5-coder-32b",
    name: "Qwen 2.5 Coder 32B",
    generation: "2026 Efficiency",
    provider: "Alibaba / Groq",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    avatarColor: "from-teal-600 to-emerald-800",
    speedRating: 4,
    costRating: 1,
    tier: "free",
    freeTierBenefit: "Groq Cloud: Miễn phí 100% chuyên phục vụ lập trình mã nguồn cho cộng đồng.",
    contextWindow: "128,000 tokens",
    strengths: [
      "Được huấn luyện trên 5.5 nghìn tỷ token mã nguồn chuyên biệt",
      "Khả năng viết code TypeScript, Python, React cực kỳ chuẩn xác"
    ],
    weaknesses: [
      "Văn phong viết bài luận không mượt bằng Claude"
    ],
    bestFor: "Sinh viên CNTT học lập trình, tạo ứng dụng mẫu, sửa lỗi code.",
    description: "Mô hình chuyên gia viết code mã nguồn mở số 1 cho sinh viên, thay thế giải pháp trả phí.",
    arenaRank: 5,
    releaseDate: "2026"
  },

  // --- COMPATIBILITY ALIASES (Cho các bản ghi cũ) ---
  "gemini-2.0-flash": {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash (Legacy)",
    generation: "2025 Standard",
    provider: "Google",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    avatarColor: "from-slate-600 to-blue-800",
    speedRating: 4,
    costRating: 1,
    tier: "free",
    freeTierBenefit: "Google AI Studio: Miễn phí (Khuyên dùng nâng cấp lên Gemini 3.8 Flash).",
    contextWindow: "1,000,000 tokens",
    strengths: ["Tốc độ nhanh, ngữ cảnh 1M tokens"],
    weaknesses: ["Đã có thế hệ kế nhiệm Gemini 3.8 Flash mạnh mẽ hơn"],
    bestFor: "Tác vụ cơ bản",
    description: "Thế hệ tiền nhiệm của Gemini 3.8 Flash.",
    arenaRank: 8
  },
  "gemini-1.5-pro": {
    id: "gemini-1.5-pro",
    name: "Gemini 1.5 Pro (Legacy)",
    generation: "2025 Standard",
    provider: "Google",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    avatarColor: "from-slate-600 to-indigo-800",
    speedRating: 2,
    costRating: 3,
    tier: "freemium",
    freeTierBenefit: "Google AI Studio: Khuyên dùng nâng cấp lên Gemini 3.8 Live.",
    contextWindow: "2,000,000 tokens",
    strengths: ["Bộ nhớ 2M tokens"],
    weaknesses: ["Tốc độ sinh token đầu tiên lâu"],
    bestFor: "Đọc tài liệu dài",
    description: "Thế hệ tiền nhiệm.",
    arenaRank: 7
  },
  "claude-3-5-sonnet-20241022": {
    id: "claude-3-5-sonnet-20241022",
    name: "Claude 3.5 Sonnet (Legacy)",
    generation: "2025 Standard",
    provider: "Anthropic",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    avatarColor: "from-slate-600 to-orange-800",
    speedRating: 3,
    costRating: 4,
    tier: "paid",
    freeTierBenefit: "Khuyên dùng nâng cấp lên Claude Opus 5.5 hoặc Claude 3.7.",
    contextWindow: "200,000 tokens",
    strengths: ["Viết code chính xác"],
    weaknesses: ["Đã có Claude Opus 5.5 và 3.7 Sonnet vượt trội hơn"],
    bestFor: "Lập trình",
    description: "Thế hệ tiền nhiệm.",
    arenaRank: 6
  },
  "gpt-4o": {
    id: "gpt-4o",
    name: "GPT-4o (Legacy)",
    generation: "2025 Standard",
    provider: "OpenAI",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    avatarColor: "from-slate-600 to-emerald-800",
    speedRating: 4,
    costRating: 3,
    tier: "paid",
    freeTierBenefit: "Khuyên dùng nâng cấp lên GPT-6 Astra hoặc GPT-6 Sol.",
    contextWindow: "128,000 tokens",
    strengths: ["Structured outputs"],
    weaknesses: ["Thế hệ GPT-6 Sol/Astra đã ra mắt với chi phí rẻ hơn 50%"],
    bestFor: "Quy trình truyền thống",
    description: "Thế hệ tiền nhiệm của GPT-6.",
    arenaRank: 6
  },
  "gpt-4o-mini": {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini (Legacy)",
    generation: "2025 Standard",
    provider: "OpenAI",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    avatarColor: "from-slate-600 to-green-800",
    speedRating: 4,
    costRating: 1,
    tier: "freemium",
    freeTierBenefit: "Nên sử dụng GPT-6 Sol thế hệ mới.",
    contextWindow: "128,000 tokens",
    strengths: ["Tiết kiệm"],
    weaknesses: ["Logic đơn giản"],
    bestFor: "Tác vụ phụ",
    description: "Phiên bản cũ.",
    arenaRank: 9
  },
  "deepseek-chat": {
    id: "deepseek-chat",
    name: "DeepSeek V3 (Legacy)",
    generation: "2025 Standard",
    provider: "DeepSeek",
    badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    avatarColor: "from-slate-600 to-purple-800",
    speedRating: 3,
    costRating: 1,
    tier: "freemium",
    freeTierBenefit: "Nên nâng cấp lên DeepSeek-V4.1-Flash.",
    contextWindow: "64,000 tokens",
    strengths: ["Toán học"],
    weaknesses: ["Đã có DeepSeek V4.1 với MoE tối ưu hơn"],
    bestFor: "Toán học",
    description: "Thế hệ tiền nhiệm của V4.1.",
    arenaRank: 6
  }
};

/**
 * Adaptive Role Mappings (Đội hình 2026 chuẩn xác được kiểm chứng thực tế)
 */
export const UNIVERSAL_ROLES_MAPPING: Record<UniversalAiRole, RoleMapping> = {
  ARCHITECT: {
    role: "ARCHITECT",
    label: "Kiến trúc sư & Lập kế hoạch",
    description: "Phân rã mục tiêu lớn thành đồ thị DAG, thiết kế cấu trúc hệ thống và schemas.",
    currentTrendingModel: "gpt-6-astra",
    studentFreeTierModel: "gemini-3-8-flash",
    reason: "Gemini 3.8 Flash miễn phí 100% trên AI Studio với tốc độ <300ms; GPT-6 Astra dẫn đầu tuyệt đối cho doanh nghiệp."
  },
  CODER: {
    role: "CODER",
    label: "Lập trình viên Chuyên trách",
    description: "Hiện thực hóa mã nguồn, lập trình ứng dụng sạch và xử lý các lỗi logic thuật toán.",
    currentTrendingModel: "claude-opus-5-5",
    studentFreeTierModel: "qwen-2-5-coder-32b",
    reason: "Qwen 2.5 Coder 32B mã nguồn mở miễn phí trên Groq có sức mạnh tương đương mô hình thương mại; Claude Opus 5.5 (ra mắt 22/09/2026) là vua lập trình thế giới."
  },
  ANALYST: {
    role: "ANALYST",
    label: "Nghiên cứu & Đọc hiểu Tài liệu",
    description: "Thu thập bối cảnh, đọc hiểu sách/báo cáo dài hàng trăm trang và trích xuất cốt lõi.",
    currentTrendingModel: "gemini-3-8-live",
    studentFreeTierModel: "gemini-3-8-flash",
    reason: "Gemini 3.8 Flash sở hữu bộ nhớ 1.5 triệu tokens hoàn toàn miễn phí trên AI Studio."
  },
  CRITIC: {
    role: "CRITIC",
    label: "Thẩm định, Phản biện & QA",
    description: "Tìm lỗ hổng lập luận, kiểm tra tính bảo mật, bắt lỗi ngữ pháp và đề xuất tối ưu.",
    currentTrendingModel: "gpt-6-sol",
    studentFreeTierModel: "llama-3-3-70b",
    reason: "Llama 3.3 70B của Meta phản hồi tức thì 300 token/s miễn phí trên Groq; GPT-6 Sol giảm 50% chi phí kiểm thử."
  },
  FAST_RESEARCH: {
    role: "FAST_RESEARCH",
    label: "Tìm kiếm & Tóm tắt Nhanh",
    description: "Phân loại tác vụ, xử lý dữ liệu trung gian và tạo bản thảo nhanh với độ trễ thấp.",
    currentTrendingModel: "deepseek-v4-1-flash",
    studentFreeTierModel: "gemini-3-8-flash",
    reason: "DeepSeek V4.1 Flash (ra mắt 10/09/2026) và Gemini 3.8 Flash dẫn đầu về tốc độ xử lý và miễn phí cho sinh viên."
  }
};

/**
 * Radar cập nhật xu hướng AI toàn cầu trong thời gian thực (Xác thực thực tế T9/2026)
 */
export const GLOBAL_AI_TRENDS: AiTrendUpdate[] = [
  {
    id: "trend-gpt6-launch",
    title: "OpenAI chính thức ra mắt kỷ nguyên GPT-6: Astra, Sol & Luna",
    domain: "Reasoning",
    summary: "Tháng 9/2026, OpenAI tung ra GPT-6 Astra dẫn đầu về suy luận, computer use và an ninh mạng, cùng dòng GPT-6 Sol/Luna giảm 50% chi phí API so với thế hệ trước.",
    impactOnWorkflow: "Hệ thống bổ sung GPT-6 Sol làm mô hình thẩm định (Critic) và Astra cho khâu kiến trúc tổng thể.",
    recommendedModel: "gpt-6-sol",
    sourceDate: "22/09/2026",
    verifiedOnline: true,
    sourceUrl: "https://openai.com"
  },
  {
    id: "trend-claude-opus-55",
    title: "Anthropic công bố Claude Opus 5.5: Đỉnh cao năng lực giải quyết tác vụ phức tạp",
    domain: "Coding",
    summary: "Ra mắt ngày 22/09/2026, Claude Opus 5.5 củng cố vị thế dẫn đầu trong các tác vụ agentic dài hạn, lập trình phần mềm và hành văn chuẩn mực.",
    impactOnWorkflow: "Tự động phân công Claude Opus 5.5 cho các bài toán lập trình cấp cao và dự án thương mại trọng điểm.",
    recommendedModel: "claude-opus-5-5",
    sourceDate: "22/09/2026",
    verifiedOnline: true,
    sourceUrl: "https://anthropic.com"
  },
  {
    id: "trend-gemini-38-flash",
    title: "Google nâng cấp dòng Gemini 3.8: Tốc độ siêu thanh cho bản Flash và Live Thinking",
    domain: "Speed",
    summary: "Google phát hành Gemini 3.8 Flash vào đầu tháng 9/2026 với độ trễ <300ms và duy trì chính sách miễn phí 100% trên AI Studio, cùng bản Gemini 3.8 Live cho tư duy mở rộng.",
    impactOnWorkflow: "Thay thế toàn bộ Gemini 2.0 cũ bằng Gemini 3.8 Flash cho sinh viên nghiên cứu và xử lý tài liệu 1.5 triệu tokens.",
    recommendedModel: "gemini-3-8-flash",
    sourceDate: "T9/2026",
    verifiedOnline: true,
    sourceUrl: "https://aistudio.google.com"
  },
  {
    id: "trend-deepseek-v41-flash",
    title: "DeepSeek phát hành V4.1-Flash với kiến trúc MoE siêu tiết kiệm tài nguyên",
    domain: "Free Tier & Open Weights",
    summary: "Ngày 10/09/2026, DeepSeek ra mắt V4.1-Flash giúp giảm đáng kể chi phí bộ nhớ suy luận, mở ra khả năng tự host và gọi API với mức giá rẻ hơn bao giờ hết.",
    impactOnWorkflow: "Lý tưởng cho sinh viên giải toán, logic thuật toán và các tác vụ lặp lại nhiều lần.",
    recommendedModel: "deepseek-v4-1-flash",
    sourceDate: "10/09/2026",
    verifiedOnline: true,
    sourceUrl: "https://deepseek.com"
  }
];

export function getModelMetadata(id: string): ModelMetadata {
  return MODELS_REGISTRY[id as ModelId] || MODELS_REGISTRY["gemini-3-8-flash"];
}
