import { ModelId } from "./types";

export interface WorkflowPreset {
  id: string;
  name: string;
  tag: string;
  complexity: "light" | "medium" | "heavy";
  complexityLabel: string;
  badgeColor: string;
  description: string;
  bestFor: string;
  estimatedTime: string;
  costTier: "100% Free" | "Freemium" | "Business";
  defaultPrompt: string;
  nodes: Array<{
    id: string;
    title: string;
    description: string;
    suggestedModel: ModelId;
    reason: string;
    promptTemplate: string;
  }>;
  edges: Array<{
    from: string;
    to: string;
  }>;
}

export const WORKFLOW_PRESETS: WorkflowPreset[] = [
  {
    id: "preset_quick_assistant",
    name: "⚡ Luồng Siêu Tốc (Lightweight)",
    tag: "Tối giản / Phản hồi tức thì",
    complexity: "light",
    complexityLabel: "Nhẹ (2 Bước)",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    description: "Quy trình tinh gọn 2 bước: 1 AI đọc hiểu & trích xuất nội dung, 1 AI rà soát & tóm tắt chuẩn xác. Phản hồi trong ~2 giây.",
    bestFor: "Đọc nhanh tài liệu, hỏi đáp bài tập, tóm tắt bài báo, viết email học thuật.",
    estimatedTime: "~2 giây",
    costTier: "100% Free",
    defaultPrompt: "Tóm tắt và phân tích các ý chính của bài giảng về Trí tuệ Nhân tạo hiện đại",
    nodes: [
      {
        id: "step_extract",
        title: "Trích xuất & Tổng thuật",
        description: "Thu thập toàn bộ ý tưởng trọng tâm, dữ liệu cốt lõi và loại bỏ thông tin thừa.",
        suggestedModel: "gemini-3-8-flash",
        reason: "Gemini 3.8 Flash miễn phí 100% trên AI Studio, độ trễ <300ms xử lý siêu thanh.",
        promptTemplate: "Đọc và trích xuất cô đọng toàn bộ các luận điểm cốt lõi, khái niệm và ví dụ minh họa chính từ yêu cầu sau:"
      },
      {
        id: "step_refine",
        title: "Chuẩn hóa & Đóng gói Kết quả",
        description: "Rà soát tính chính xác, định dạng lại mạch lạc với danh sách tóm tắt và hành động cụ thể.",
        suggestedModel: "llama-3-3-70b",
        reason: "Llama 3.3 70B trên Groq phản biện khách quan, tốc độ 300+ token/s miễn phí.",
        promptTemplate: "Dựa trên dữ liệu đã trích xuất, hãy hoàn thiện văn bản tổng kết súc tích, dễ nhớ, có danh sách Key Takeaways rõ ràng:"
      }
    ],
    edges: [
      { from: "step_extract", to: "step_refine" }
    ]
  },
  {
    id: "preset_software_builder",
    name: "💻 Lập Trình & Tạo Web/App (Standard)",
    tag: "Đồ án CNTT / Lập trình",
    complexity: "medium",
    complexityLabel: "Tiêu chuẩn (3 Bước)",
    badgeColor: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    description: "Quy trình 3 bước khép kín cho lập trình viên & sinh viên CNTT: Thiết kế Kiến trúc -> Sinh Mã nguồn Lõi -> Phản biện & Kiểm thử Edge Cases.",
    bestFor: "Xây dựng ứng dụng web, viết backend API, tạo đồ án môn học, sửa lỗi và tối ưu thuật toán.",
    estimatedTime: "~5 giây",
    costTier: "100% Free",
    defaultPrompt: "Xây dựng ứng dụng Todo & Habit Tracker với Next.js, TypeScript và Tailwind CSS",
    nodes: [
      {
        id: "step_arch",
        title: "Thiết kế Kiến trúc & Specs",
        description: "Xác định tech-stack, thiết kế database schema, cấu trúc component và API endpoints.",
        suggestedModel: "gemini-3-8-flash",
        reason: "Gemini 3.8 Flash thiết kế quy hoạch hệ thống cực nhanh với chi phí 0đ.",
        promptTemplate: "Hãy thiết kế tài liệu kiến trúc kỹ thuật chi tiết: sơ đồ component, data models TypeScript và danh sách API endpoints cần thiết cho:"
      },
      {
        id: "step_code",
        title: "Viết Mã Nguồn Lõi Chuẩn",
        description: "Hiện thực hóa toàn bộ mã nguồn sạch, có type-safe, cấu trúc thư mục rõ ràng và xử lý lỗi cẩn thận.",
        suggestedModel: "qwen-2-5-coder-32b",
        reason: "Qwen 2.5 Coder 32B đào tạo chuyên sâu trên 5.5T tokens code, miễn phí 100% trên Groq.",
        promptTemplate: "Dựa vào kiến trúc đã thiết kế, hãy viết toàn bộ mã nguồn TypeScript/React hoàn chỉnh, chuẩn modular, sẵn sàng chạy ngay:"
      },
      {
        id: "step_qa",
        title: "Phản biện, Bảo mật & Kiểm thử",
        description: "Rà soát lỗ hổng bảo mật, kiểm tra edge-cases, tối ưu hiệu năng và hướng dẫn triển khai.",
        suggestedModel: "llama-3-3-70b",
        reason: "Llama 3.3 70B của Meta đưa ra các phản biện sắc sảo, độc lập và chi tiết.",
        promptTemplate: "Hãy đánh giá mã nguồn trên: chỉ ra các điểm nghẽn hiệu năng, nguy cơ bảo mật, bổ sung unit tests và hướng dẫn deploy:"
      }
    ],
    edges: [
      { from: "step_arch", to: "step_code" },
      { from: "step_code", to: "step_qa" }
    ]
  },
  {
    id: "preset_deep_research",
    name: "🔬 Nghiên Cứu & Luận Văn Sâu (Heavyweight MoE)",
    tag: "Nghiên cứu / Luận văn tốt nghiệp",
    complexity: "heavy",
    complexityLabel: "Nâng cao (4 Bước)",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    description: "Mô hình Mixture-of-Agents 4 bước kết hợp ngữ cảnh 1.5M tokens, năng lực toán học MoE và phản biện học thuật cho các đề tài phức tạp.",
    bestFor: "Khóa luận tốt nghiệp, bài báo khoa học, phân tích thị trường vĩ mô, giải toán và mô hình hóa kỹ thuật.",
    estimatedTime: "~8 giây",
    costTier: "100% Free",
    defaultPrompt: "Nghiên cứu tác động của AI MoE đến hiệu năng xử lý phần cứng và xây dựng mô hình định giá tối ưu",
    nodes: [
      {
        id: "step_lit_review",
        title: "Thu thập Bối cảnh & Dữ liệu",
        description: "Quét tài liệu nghiên cứu, tổng hợp các công trình tiền nhiệm và các số liệu thực chứng.",
        suggestedModel: "gemini-3-8-flash",
        reason: "Ngữ cảnh 1.5M tokens đọc hiểu lượng tài liệu khổng lồ miễn phí trên AI Studio.",
        promptTemplate: "Tổng thuật toàn diện các nghiên cứu học thuật, bối cảnh lý thuyết và số liệu liên quan đến đề tài:"
      },
      {
        id: "step_math_logic",
        title: "Mô hình hóa Toán & Phân tích Logic",
        description: "Thiết lập công thức toán học, mô hình định lượng và phân tích chuỗi suy luận logic.",
        suggestedModel: "deepseek-v4-1-flash",
        reason: "DeepSeek V4.1 MoE dẫn đầu về năng lực toán học và thuật toán với chi phí cực thấp.",
        promptTemplate: "Dựa vào bối cảnh nghiên cứu, hãy xây dựng mô hình toán học (sử dụng công thức LaTeX), chứng minh logic và phân tích định lượng:"
      },
      {
        id: "step_thesis_draft",
        title: "Chấp bút Văn bản Học thuật",
        description: "Soạn thảo bài luận học thuật hoàn chỉnh với lập luận chặt chẽ, phong cách học thuật chuẩn mực.",
        suggestedModel: "gemini-3-8-live",
        reason: "Gemini 3.8 Live tích hợp Extended Thinking tư duy chuỗi suy luận sâu sắc.",
        promptTemplate: "Dựa trên dữ liệu và mô hình toán trên, hãy viết bài nghiên cứu hoàn chỉnh theo cấu trúc chuẩn IMRAD (Introduction, Methods, Results, Discussion):"
      },
      {
        id: "step_peer_review",
        title: "Hội đồng Phản biện Độc lập",
        description: "Đóng vai hội đồng thẩm định: tìm ra các giả định còn yếu, nguy cơ sai số và đề xuất hướng nghiên cứu tiếp theo.",
        suggestedModel: "llama-3-3-70b",
        reason: "Llama 3.3 70B phản biện đa chiều không thiên vị với tốc độ siêu thanh.",
        promptTemplate: "Đóng vai trò chuyên gia phản biện bài báo: hãy chỉ trích các giả định yếu, kiểm tra tính đúng đắn của công thức và đưa ra khuyến nghị cải tiến:"
      }
    ],
    edges: [
      { from: "step_lit_review", to: "step_math_logic" },
      { from: "step_math_logic", to: "step_thesis_draft" },
      { from: "step_thesis_draft", to: "step_peer_review" }
    ]
  },
  {
    id: "preset_debate_consensus",
    name: "⚖️ Đối Lập & Đồng Thuận (Multi-Agent Debate)",
    tag: "Tư duy phản biện / Đa chiều",
    complexity: "heavy",
    complexityLabel: "Độc đáo (4 Bước Song song)",
    badgeColor: "bg-cyan-500/10 text-cyan-300 border-cyan-500/30",
    description: "Hai AI độc lập phân tích 2 góc nhìn đối lập chạy song song, sau đó một AI trọng tài tổng hợp thành phương án dung hòa tối ưu nhất.",
    bestFor: "Ra quyết định kinh doanh, lựa chọn kiến trúc phần mềm, tranh biện pháp lý, đánh giá ưu nhược điểm.",
    estimatedTime: "~6 giây",
    costTier: "100% Free",
    defaultPrompt: "Nên sử dụng kiến trúc Monolithic hay Microservices cho một startup giai đoạn đầu?",
    nodes: [
      {
        id: "step_view_a",
        title: "Luận điểm A (Góc nhìn Ủng hộ)",
        description: "Tập trung xây dựng hệ thống luận cứ vững chắc nhất bảo vệ phương án A.",
        suggestedModel: "gemini-3-8-flash",
        reason: "Gemini 3.8 Flash tổng hợp dữ liệu tốc độ cao và lập luận nhanh.",
        promptTemplate: "Hãy đóng vai người ủng hộ nhiệt thành: Đưa ra 5 lý do mạnh mẽ nhất cùng case study thực tế bảo vệ phương án A cho vấn đề:"
      },
      {
        id: "step_view_b",
        title: "Luận điểm B (Góc nhìn Phản biện)",
        description: "Chạy song song: Tìm ra mọi điểm yếu, rủi ro và bảo vệ phương án thay thế B.",
        suggestedModel: "deepseek-v4-1-flash",
        reason: "DeepSeek V4.1 phân tích logic sắc sảo, vạch ra các rủi ro tiềm ẩn.",
        promptTemplate: "Hãy đóng vai người phản biện độc lập: Đưa ra 5 rủi ro lớn nhất và chứng minh vì sao phương án thay thế B lại an toàn hơn:"
      },
      {
        id: "step_rebuttal",
        title: "Tranh biện Chéo (Cross-Exam)",
        description: "Đặt 2 phương án lên bàn cân, đối chiếu trực tiếp các luận điểm mâu thuẫn.",
        suggestedModel: "llama-3-3-70b",
        reason: "Llama 3.3 70B đối chiếu khách quan với tốc độ 300+ tok/s.",
        promptTemplate: "Hãy đối chiếu 2 bản phân tích trên: Chỉ ra đâu là luận điểm có căn cứ nhất và đâu là ngụy biện:"
      },
      {
        id: "step_consensus",
        title: "Phán quyết & Giải pháp Dung hòa",
        description: "Tổng hợp giải pháp dung hòa tốt nhất kèm ma trận quyết định và lộ trình triển khai.",
        suggestedModel: "gemini-3-8-flash",
        reason: "Tổng hợp mạch lạc thành sản phẩm cuối cùng.",
        promptTemplate: "Dựa trên toàn bộ phiên tranh biện, hãy đưa ra kết luận cuối cùng: Một chiến lược tối ưu nhất kèm ma trận quyết định cụ thể:"
      }
    ],
    edges: [
      { from: "step_view_a", to: "step_rebuttal" },
      { from: "step_view_b", to: "step_rebuttal" },
      { from: "step_rebuttal", to: "step_consensus" }
    ]
  },
  {
    id: "preset_enterprise_frontier",
    name: "🏢 Doanh Nghiệp & Chiến Lược Cấp Cao (Enterprise)",
    tag: "Thương mại / Frontier Pro",
    complexity: "medium",
    complexityLabel: "Cao cấp (3 Bước)",
    badgeColor: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    description: "Đội hình cờ đầu hội tụ các mô hình thương mại mạnh nhất thế giới (GPT-6 Astra + Claude Opus 5.5 + GPT-6 Sol).",
    bestFor: "Chiến lược kinh doanh, kiến trúc enterprise, thẩm định pháp lý và dự án thương mại quan trọng.",
    estimatedTime: "~7 giây",
    costTier: "Business",
    defaultPrompt: "Xây dựng chiến lược mở rộng thị trường Đông Nam Á cho nền tảng FinTech",
    nodes: [
      {
        id: "step_enterprise_plan",
        title: "Quy hoạch Chiến lược Tổng thể",
        description: "Lập kế hoạch đa bước, phân tích thị trường và khung kiến trúc cấp doanh nghiệp.",
        suggestedModel: "gpt-6-astra",
        reason: "Mô hình đầu bảng OpenAI phát hành T9/2026, dẫn đầu tư duy chiến lược.",
        promptTemplate: "Hãy quy hoạch chiến lược tổng thể cấp doanh nghiệp, phân tích SWOT và lộ trình triển khai chi tiết:"
      },
      {
        id: "step_enterprise_exec",
        title: "Thiết kế Giải pháp Kỹ thuật & Nghiệp vụ",
        description: "Hiện thực hóa tài liệu kỹ thuật, kiến trúc bảo mật và quy trình vận hành chi tiết.",
        suggestedModel: "claude-opus-5-5",
        reason: "Claude Opus 5.5 (Ra mắt 22/09/2026) số 1 thế giới về hệ thống phức tạp.",
        promptTemplate: "Dựa vào quy hoạch chiến lược, hãy thiết kế giải pháp kỹ thuật, chính sách tuân thủ và quy trình nghiệp vụ chi tiết:"
      },
      {
        id: "step_enterprise_audit",
        title: "Thẩm định Rủi ro & Bảng Định giá ROI",
        description: "Rà soát tính khả thi tài chính, bảng dự phóng ROI và phương án phòng ngừa rủi ro.",
        suggestedModel: "gpt-6-sol",
        reason: "GPT-6 Sol tối ưu chi phí 50% với khả năng kiểm định và phân tích số liệu chuẩn xác.",
        promptTemplate: "Hãy thẩm định tài chính, tính toán bảng dự phóng ROI 3 năm và kế hoạch kiểm soát rủi ro cho đề án trên:"
      }
    ],
    edges: [
      { from: "step_enterprise_plan", to: "step_enterprise_exec" },
      { from: "step_enterprise_exec", to: "step_enterprise_audit" }
    ]
  }
];
