export type AiToolCall = {
  id: string;
  tool: string;
  input: Record<string, unknown>;
  result?: unknown;
  error?: string;
  status: 'pending' | 'success' | 'error';
};

export type AiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolCalls?: AiToolCall[];
};
