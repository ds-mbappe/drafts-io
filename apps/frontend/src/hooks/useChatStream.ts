'use client';

import { useCallback, useContext, useState } from 'react';
import { NextSessionContext } from '@/contexts/SessionContext';
import { backendUrl } from '@/lib/backend';
import type { AiMessage, AiToolCall } from '@/lib/ai-types';

export function useChatStream() {
  const { session } = useContext(NextSessionContext);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [pendingToolCalls, setPendingToolCalls] = useState<AiToolCall[]>([]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isStreaming || !text.trim()) return;

      const userMessage: AiMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content: text.trim(),
      };

      const history = [...messages, userMessage];
      setMessages(history);
      setIsStreaming(true);
      setStreamingText('');
      setPendingToolCalls([]);

      const payload = history.map((m) => ({ role: m.role, content: m.content }));

      try {
        const res = await fetch(backendUrl('/api/ai/chat'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify({ messages: payload }),
        });

        if (!res.body) throw new Error('No response body');

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let accumulatedText = '';
        let toolCalls: AiToolCall[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6);
            if (raw === '[DONE]') continue;

            try {
              const event = JSON.parse(raw) as Record<string, unknown>;

              if (event.type === 'text') {
                accumulatedText += event.text as string;
                setStreamingText(accumulatedText);
              } else if (event.type === 'tool_start') {
                // Guard against duplicates — early announce has no input yet
                if (!toolCalls.find((tc) => tc.id === (event.toolId as string))) {
                  const tc: AiToolCall = {
                    id: event.toolId as string,
                    tool: event.tool as string,
                    input: event.input as Record<string, unknown>,
                    status: 'pending',
                  };
                  toolCalls = [...toolCalls, tc];
                  setPendingToolCalls([...toolCalls]);
                }
              } else if (event.type === 'tool_input') {
                // Full input arrived — update the existing pending card
                toolCalls = toolCalls.map((tc) =>
                  tc.id === (event.toolId as string)
                    ? { ...tc, input: event.input as Record<string, unknown> }
                    : tc,
                );
                setPendingToolCalls([...toolCalls]);
              } else if (event.type === 'tool_result') {
                toolCalls = toolCalls.map((tc) =>
                  tc.id === event.toolId
                    ? {
                        ...tc,
                        status: event.error ? ('error' as const) : ('success' as const),
                        result: event.result,
                        error: event.error as string | undefined,
                      }
                    : tc,
                );
                setPendingToolCalls([...toolCalls]);
              }
            } catch {
              // malformed SSE line — skip
            }
          }
        }

        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: accumulatedText,
            toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
          },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'Something went wrong. Please try again.',
          },
        ]);
      } finally {
        setIsStreaming(false);
        setStreamingText('');
        setPendingToolCalls([]);
      }
    },
    [messages, isStreaming, session],
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setStreamingText('');
    setPendingToolCalls([]);
  }, []);

  return { messages, isStreaming, streamingText, pendingToolCalls, sendMessage, clearMessages };
}
