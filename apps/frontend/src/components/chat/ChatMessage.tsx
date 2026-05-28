import React from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileTextIcon } from 'lucide-react';
import { ToolCard } from './ToolCard';
import type { AiMessage } from '@/lib/ai-types';

function DraftLinkCard({ href, title }: { href: string; title: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-3 py-2 my-1 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/60 transition-colors text-sm text-foreground no-underline group"
    >
      <FileTextIcon size={14} className="text-primary shrink-0" />
      <span className="font-medium group-hover:text-primary transition-colors line-clamp-1 break-all">
        {title}
      </span>
    </Link>
  );
}

function MarkdownLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  if (!href) return <>{children}</>;

  const isDraftLink = href.startsWith('/app/drafts/');
  const isInternal = href.startsWith('/');
  const title = typeof children === 'string' ? children : String(children ?? '');

  if (isDraftLink) {
    return <DraftLinkCard href={href} title={title} />;
  }

  if (isInternal) {
    return (
      <Link href={href} className="underline text-primary hover:opacity-80">
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
      {children}
    </a>
  );
}

export function ChatMessage({ message }: { message: AiMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
      {message.toolCalls && message.toolCalls.length > 0 && (
        <div className="flex flex-col gap-1.5 w-full">
          {message.toolCalls.map((tc) => (
            <ToolCard key={tc.id} toolCall={tc} />
          ))}
        </div>
      )}

      {message.content && (
        <div
          className={`px-3 py-2 rounded-2xl text-sm max-w-[85%] leading-relaxed ${
            isUser
              ? 'bg-primary text-primary-foreground rounded-br-sm'
              : 'bg-content2 text-foreground rounded-bl-sm'
          }`}
        >
          {isUser ? (
            <span className="whitespace-pre-wrap">{message.content}</span>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              disallowedElements={['script', 'style', 'iframe', 'object', 'embed']}
              unwrapDisallowed
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                em: ({ children }) => <em className="italic">{children}</em>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-0.5">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-0.5">{children}</ol>,
                li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-');
                  return isBlock ? (
                    <code className="block bg-black/10 dark:bg-white/10 rounded-lg px-3 py-2 my-2 text-xs font-mono overflow-x-auto whitespace-pre">
                      {children}
                    </code>
                  ) : (
                    <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 text-xs font-mono">
                      {children}
                    </code>
                  );
                },
                pre: ({ children }) => <>{children}</>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-2 border-primary/50 pl-3 italic text-foreground-500 my-2">
                    {children}
                  </blockquote>
                ),
                h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
                h3: ({ children }) => <h3 className="text-sm font-semibold mb-1">{children}</h3>,
                a: ({ href, children }) => <MarkdownLink href={href} children={children} />,
                hr: () => <hr className="border-divider my-2" />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>
      )}
    </div>
  );
}
