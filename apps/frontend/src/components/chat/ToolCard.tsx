import React from 'react';
import Link from 'next/link';
import { Spinner } from '@heroui/react';
import { CheckIcon, ClockIcon, FileTextIcon, XIcon } from 'lucide-react';
import type { AiToolCall } from '@/lib/ai-types';
import { useTranslations } from 'next-intl';

const TOOL_LABEL_KEYS: Record<string, string> = {
  get_my_drafts: 'toolLabels.get_my_drafts',
  get_draft: 'toolLabels.get_draft',
  get_public_drafts: 'toolLabels.get_public_drafts',
  create_draft: 'toolLabels.create_draft',
  update_draft: 'toolLabels.update_draft',
  delete_draft: 'toolLabels.delete_draft',
};

const DRAFT_RESULT_TOOLS = new Set(['get_my_drafts', 'get_public_drafts', 'get_draft']);

type DraftItem = {
  id: string;
  title: string;
  topics?: string[];
  createdAt?: string;
  word_count?: number | null;
};

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function DraftResultCard({ draft, t }: { draft: DraftItem; t: (key: string) => string }) {
  return (
    <Link
      href={`/app/drafts/${draft.id}`}
      className="flex flex-col gap-1.5 px-3 py-2.5 rounded-xl border border-divider bg-content1 hover:border-primary/50 hover:bg-primary/5 transition-colors no-underline group"
    >
      <div className="flex items-start gap-2">
        <FileTextIcon size={13} className="text-primary shrink-0 mt-0.5" />
        <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
          {draft.title}
        </span>
      </div>

      {draft.topics && draft.topics.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-5">
          {draft.topics.slice(0, 3).map((t) => (
            <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
              {t}
            </span>
          ))}
          {draft.topics.length > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-content2 text-foreground-400">
              +{draft.topics.length - 3}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 pl-5">
        {draft.createdAt && (
          <span className="text-[10px] text-foreground-400">{formatDate(draft.createdAt)}</span>
        )}
        {draft.word_count != null && draft.word_count > 0 && (
          <span className="flex items-center gap-0.5 text-[10px] text-foreground-400">
            <ClockIcon size={9} />
            {draft.word_count} {t('words')}
          </span>
        )}
      </div>
    </Link>
  );
}

function DraftResults({ tool, result, t }: { tool: string; result: unknown; t: (key: string) => string }) {
  if (tool === 'get_draft') {
    const draft = result as DraftItem;
    if (!draft?.id) return null;
    return (
      <div className="mt-2">
        <DraftResultCard draft={draft} t={t} />
      </div>
    );
  }

  const data = result as { items?: DraftItem[] };
  const items = data?.items;
  if (!items?.length) return <p className="text-xs text-foreground-400 mt-1">{t('noDraftsFound')}</p>;

  return (
    <div className="flex flex-col gap-1.5 mt-2">
      {items.map((draft) => (
        <DraftResultCard key={draft.id} draft={draft} t={t} />
      ))}
    </div>
  );
}

function summariseInput(tool: string, input: Record<string, unknown>): string | null {
  if (tool === 'create_draft' && input.title) return `"${input.title}"`;
  if (tool === 'update_draft' && input.draftId) return `ID: ${String(input.draftId).slice(-8)}`;
  if (tool === 'delete_draft' && input.draftId) return `ID: ${String(input.draftId).slice(-8)}`;
  if (tool === 'get_draft' && input.draftId) return `ID: ${String(input.draftId).slice(-8)}`;
  if ((tool === 'get_my_drafts' || tool === 'get_public_drafts') && input.search)
    return `"${input.search}"`;
  return null;
}

export function ToolCard({ toolCall }: { toolCall: AiToolCall }) {
  const t = useTranslations('aiChat');
  const labelKey = TOOL_LABEL_KEYS[toolCall.tool];
  const label = labelKey ? t(labelKey) : toolCall.tool;
  const subtitle = summariseInput(toolCall.tool, toolCall.input);
  const showDraftResults =
    DRAFT_RESULT_TOOLS.has(toolCall.tool) &&
    toolCall.status === 'success' &&
    toolCall.result != null;

  return (
    <div className="px-3 py-2 rounded-xl border border-divider bg-content2 text-sm w-full">
      <div className="flex items-center gap-2">
        <div className="shrink-0">
          {toolCall.status === 'pending' && <Spinner size="sm" color="accent" />}
          {toolCall.status === 'success' && (
            <div className="w-4 h-4 rounded-full bg-success flex items-center justify-center">
              <CheckIcon size={10} className="text-white" />
            </div>
          )}
          {toolCall.status === 'error' && (
            <div className="w-4 h-4 rounded-full bg-danger flex items-center justify-center">
              <XIcon size={10} className="text-white" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={`font-medium ${toolCall.status === 'error' ? 'text-danger' : 'text-foreground'}`}>
            {label}{toolCall.status === 'pending' ? '...' : ''}
          </span>
          {subtitle && <span className="text-foreground-500 text-xs truncate">{subtitle}</span>}
          {toolCall.status === 'error' && toolCall.error && (
            <span className="text-danger text-xs">{toolCall.error}</span>
          )}
        </div>
      </div>

      {showDraftResults && <DraftResults tool={toolCall.tool} result={toolCall.result} t={t} />}
    </div>
  );
}
