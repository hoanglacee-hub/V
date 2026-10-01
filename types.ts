export type ModelId =
  // 2026 Frontier & Efficiency Generation
  | "gemini-3-8-flash"
  | "gemini-3-8-live"
  | "claude-opus-5-5"
  | "claude-3-7-sonnet"
  | "gpt-6-astra"
  | "gpt-6-sol"
  | "deepseek-v4-1-flash"
  | "deepseek-r1"
  | "llama-3-3-70b"
  | "llama-3.3-70b"
  | "qwen-2-5-coder-32b"
  | "qwen-2.5-coder-32b"
  // Previous generation compatibility aliases
  | "gemini-2.0-flash"
  | "gemini-1.5-pro"
  | "claude-3-5-sonnet-20241022"
  | "gpt-4o"
  | "gpt-4o-mini"
  | "deepseek-chat";

export interface ModelMetadata {
  id: ModelId;
  name: string;
  generation: "2026 Frontier" | "2026 Efficiency" | "2025 Standard";
  provider: "Anthropic" | "Google" | "OpenAI" | "DeepSeek" | "Meta / Groq" | "Alibaba / Groq";
  badgeColor: string;
  avatarColor: string;
  speedRating: 1 | 2 | 3 | 4 | 5; // 1 slow, 5 instant
  costRating: 1 | 2 | 3 | 4 | 5;  // 1 cheap, 5 expensive
  tier: "free" | "freemium" | "paid";
  freeTierBenefit: string;
  contextWindow: string;
  strengths: string[];
  weaknesses: string[];
  bestFor: string;
  description: string;
  arenaRank?: number;
  releaseDate?: string;
}

export type UniversalAiRole = "ARCHITECT" | "CODER" | "ANALYST" | "CRITIC" | "FAST_RESEARCH";

export interface RoleMapping {
  role: UniversalAiRole;
  label: string;
  description: string;
  currentTrendingModel: ModelId;
  studentFreeTierModel: ModelId;
  reason: string;
}

export interface AiTrendUpdate {
  id: string;
  title: string;
  domain: "Coding" | "Reasoning" | "Free Tier & Open Weights" | "Multimodal" | "Speed";
  summary: string;
  impactOnWorkflow: string;
  recommendedModel: ModelId;
  sourceDate: string;
  verifiedOnline: boolean;
  sourceUrl?: string;
}

export interface WebSearchAiUpdate {
  title: string;
  source: string;
  date: string;
  snippet: string;
  url: string;
}

export interface DecomposedNode {
  id: string;
  title: string;
  description: string;
  suggestedModel: ModelId;
  reason: string;
  promptTemplate?: string;
  role?: UniversalAiRole;
}

export interface DecomposedEdge {
  from: string;
  to: string;
}

export interface DecompositionResult {
  taskGoal: string;
  nodes: DecomposedNode[];
  edges: DecomposedEdge[];
}

export interface ApiKeyConfig {
  openaiApiKey?: string;
  anthropicApiKey?: string;
  geminiApiKey?: string;
  deepseekApiKey?: string;
  groqApiKey?: string;
}

export type TaskStatus = "PLANNING" | "READY" | "RUNNING" | "COMPLETED" | "FAILED";
export type NodeStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";

export interface NodeExecutionUpdate {
  nodeKey: string;
  status: NodeStatus;
  output?: string;
  error?: string;
  model: string;
  tokensUsed?: number;
  latencyMs?: number;
}
