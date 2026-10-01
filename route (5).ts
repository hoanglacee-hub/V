import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { provider, apiKey } = await req.json();

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return NextResponse.json(
        { valid: false, error: "Vui lòng nhập API key trước khi kiểm thử" },
        { status: 400 }
      );
    }

    const key = apiKey.trim();

    if (provider === "google") {
      // Test Gemini API key via models endpoint
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
        { signal: AbortSignal.timeout(6000) }
      );
      if (res.ok) {
        return NextResponse.json({
          valid: true,
          provider: "Google AI Studio",
          latencyMs: Date.now() - startTime,
          message: "Khóa Google Gemini hợp lệ! Sẵn sàng sử dụng với Gemini 3.8 Flash miễn phí.",
        });
      } else {
        const data = await res.json().catch(() => ({}));
        return NextResponse.json({
          valid: false,
          error: data.error?.message || "Khóa Google API không hợp lệ hoặc đã bị vô hiệu hóa",
        });
      }
    }

    if (provider === "groq") {
      // Test Groq Cloud key
      const res = await fetch("https://api.groq.com/openai/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        return NextResponse.json({
          valid: true,
          provider: "Groq Cloud",
          latencyMs: Date.now() - startTime,
          message: "Khóa Groq Cloud hợp lệ! Tốc độ 300+ token/s miễn phí trên Llama 3.3 & Qwen Coder.",
        });
      } else {
        return NextResponse.json({
          valid: false,
          error: "Khóa Groq API không chính xác hoặc hết hạn ngạch",
        });
      }
    }

    if (provider === "openai") {
      // Test OpenAI key
      const res = await fetch("https://api.openai.com/v1/models", {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        return NextResponse.json({
          valid: true,
          provider: "OpenAI",
          latencyMs: Date.now() - startTime,
          message: "Khóa OpenAI hợp lệ! Hỗ trợ GPT-6 Astra, GPT-6 Sol và GPT-4o.",
        });
      } else {
        return NextResponse.json({
          valid: false,
          error: "Khóa OpenAI không hợp lệ hoặc tài khoản chưa nạp credit",
        });
      }
    }

    if (provider === "anthropic") {
      // Test Anthropic key (GET /v1/models or test auth)
      const res = await fetch("https://api.anthropic.com/v1/models", {
        headers: {
          "x-api-key": key,
          "anthropic-version": "2023-06-01",
        },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        return NextResponse.json({
          valid: true,
          provider: "Anthropic",
          latencyMs: Date.now() - startTime,
          message: "Khóa Anthropic hợp lệ! Sẵn sàng chạy Claude Opus 5.5 & Claude 3.7.",
        });
      } else {
        return NextResponse.json({
          valid: false,
          error: "Khóa Anthropic API không chính xác hoặc thiếu quyền truy cập",
        });
      }
    }

    if (provider === "deepseek") {
      // Test DeepSeek key
      const res = await fetch("https://api.deepseek.com/models", {
        headers: { Authorization: `Bearer ${key}` },
        signal: AbortSignal.timeout(6000),
      });
      if (res.ok) {
        return NextResponse.json({
          valid: true,
          provider: "DeepSeek",
          latencyMs: Date.now() - startTime,
          message: "Khóa DeepSeek hợp lệ! Sẵn sàng sử dụng DeepSeek-V4.1-Flash & R1.",
        });
      } else {
        return NextResponse.json({
          valid: false,
          error: "Khóa DeepSeek API không hợp lệ hoặc không có kết nối",
        });
      }
    }

    return NextResponse.json({ valid: false, error: "Nhà cung cấp không xác định" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({
      valid: false,
      error: error.name === "TimeoutError" ? "Hết thời gian chờ phản hồi (Timeout > 6s)" : "Không thể kết nối đến máy chủ API",
      latencyMs: Date.now() - startTime,
    });
  }
}
