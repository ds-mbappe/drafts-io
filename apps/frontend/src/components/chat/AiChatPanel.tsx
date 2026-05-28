'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@heroui/react';
import { Maximize2Icon, Minimize2Icon, SparklesIcon, Trash2Icon, XIcon } from 'lucide-react';
import { useChatStream } from '@/hooks/useChatStream';
import { useAiChatStore } from '@/stores/aiChatStore';
import { useMobile } from '@/hooks/useMobile';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ToolCard } from './ToolCard';
import { useTranslations } from 'next-intl';

type ExpandState = 'compact' | 'expanded';

const GAP = 16;
const PANEL_WIDTH = 384;

const compactStyle = (isMobile: boolean) => isMobile
  ? { bottom: GAP, left: GAP, right: GAP, width: 'auto', height: 520, borderRadius: 20 }
  : { bottom: 20, right: 20, width: PANEL_WIDTH, height: 520, borderRadius: 20 };

const expandedStyle = (isMobile: boolean) => isMobile
  ? { top: 0, left: 0, right: 0, bottom: 0, width: '100dvw', height: '100dvh', borderRadius: 0 }
  : { top: 0, right: 0, bottom: 0, width: PANEL_WIDTH, height: '100dvh', borderRadius: 0 };

export function AiChatPanel() {
  const t = useTranslations('aiChat');
  const { isOpen, open, close } = useAiChatStore();
  const [expandState, setExpandState] = useState<ExpandState>('compact');
  const isMobile = !useMobile(); // useMobile returns true when >= 768
  const { messages, isStreaming, streamingText, pendingToolCalls, sendMessage, clearMessages } =
    useChatStream();
  const bottomRef = useRef<HTMLDivElement>(null);

  const isExpanded = expandState === 'expanded';

  // Reset to compact when panel is closed so it always opens fresh.
  useEffect(() => {
    if (!isOpen) setExpandState('compact');
  }, [isOpen]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText, pendingToolCalls]);

  const handleSend = (text: string) => {
    sendMessage(text);
  };

  return (
    <>
      {/* FAB — visible only when panel is closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-primary shadow-lg flex items-center justify-center text-white cursor-pointer"
            onClick={open}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.92 }}
            title="Drafts AI"
          >
            <motion.span
              className="flex"
              animate={{ rotate: [0, 25, -25, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', repeatDelay: 1.5 }}
            >
              <SparklesIcon size={20} />
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded backdrop */}
      <AnimatePresence>
        {isOpen && isExpanded && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setExpandState('compact')}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed z-50 flex flex-col bg-content1 border border-divider shadow-2xl overflow-hidden"
            initial={{ ...compactStyle(isMobile), opacity: 0, scale: 0.85 }}
            animate={
              isExpanded
                ? { ...expandedStyle(isMobile), opacity: 1, scale: 1 }
                : { ...compactStyle(isMobile), opacity: 1, scale: 1 }
            }
            exit={{ ...compactStyle(isMobile), opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-divider shrink-0">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                >
                  <SparklesIcon size={18} className="text-primary" />
                </motion.div>
                <span className="font-semibold text-sm">Drafts AI</span>
              </div>

              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <Button isIconOnly size="sm" variant="ghost" onPress={clearMessages} aria-label={t('clearLabel')}>
                    <Trash2Icon size={15} className="text-foreground-500" />
                  </Button>
                )}
                {!isMobile && (
                  <Button
                    isIconOnly
                    size="sm"
                    variant="ghost"
                    onPress={() => setExpandState(isExpanded ? 'compact' : 'expanded')}
                    aria-label={isExpanded ? t('minimiseLabel') : t('expandLabel')}
                  >
                    {isExpanded
                      ? <Minimize2Icon size={15} className="text-foreground-500" />
                      : <Maximize2Icon size={15} className="text-foreground-500" />
                    }
                  </Button>
                )}
                <Button isIconOnly size="sm" variant="ghost" onPress={close}>
                  <XIcon size={16} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4">
              {messages.length === 0 && !isStreaming ? (
                <motion.div
                  className="flex flex-col items-center justify-center h-full gap-5 text-center px-2"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  >
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <SparklesIcon size={32} className="text-primary" />
                      </div>
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full bg-primary"
                          style={{
                            top: i === 0 ? -4 : i === 1 ? 8 : -8,
                            right: i === 0 ? -4 : i === 1 ? -12 : 14,
                          }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                          transition={{
                            repeat: Infinity,
                            duration: 2,
                            delay: i * 0.4,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>

                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-foreground">{t('greeting')}</p>
                    <p className="text-sm text-foreground-500">
                      {t('greetingDescription')}
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 w-full">
                    {(['showDrafts', 'createDraft', 'searchPublic', 'whatCanYouDo'] as const).map((key) => (
                      <motion.button
                        key={key}
                        className="text-xs px-3 py-1.5 rounded-full border border-divider text-foreground-600 hover:border-primary hover:text-primary transition-colors"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => handleSend(t(`suggestedPrompts.${key}`))}
                      >
                        {t(`suggestedPrompts.${key}`)}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}

                  {isStreaming && pendingToolCalls.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      {pendingToolCalls.map((tc) => (
                        <ToolCard key={tc.id} toolCall={tc} />
                      ))}
                    </div>
                  )}

                  {isStreaming && streamingText && (
                    <div className="flex items-start">
                      <div className="px-3 py-2 rounded-2xl rounded-bl-sm text-sm max-w-[85%] bg-content2 text-foreground whitespace-pre-wrap leading-relaxed">
                        {streamingText}
                      </div>
                    </div>
                  )}

                  {/* Initial thinking — no text yet */}
                  {isStreaming && !streamingText && pendingToolCalls.length === 0 && (
                    <div className="flex items-start">
                      <div className="px-3 py-2 rounded-2xl rounded-bl-sm bg-content2 text-sm">
                        <motion.span
                          className="text-foreground-400"
                          animate={{ opacity: [1, 0.4, 1] }}
                          transition={{ repeat: Infinity, duration: 1.2 }}
                        >
                          {t('thinking')}
                        </motion.span>
                      </div>
                    </div>
                  )}

                  {/* Global in-progress dots — always visible while streaming so the
                      gap between text ending and a tool card appearing is never blank. */}
                  {isStreaming && (
                    <div className="flex items-center gap-1 pl-1 pb-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-foreground-300"
                          animate={{ y: [0, -4, 0] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.7,
                            delay: i * 0.15,
                            ease: 'easeInOut',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="shrink-0">
              <ChatInput onSend={handleSend} disabled={isStreaming} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
