import { BadRequestException, Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { Response } from 'express';
import { DraftsService } from 'src/drafts/drafts.service';
import { ContentService } from 'src/content/content.service';
import { handleHttpError } from 'src/utils/handle-http-error';

const TRANSLATE_TEXT_PROMPT = (language: string) =>
  `You are a translator. Translate the following text to ${language}. Return only the translated text, nothing else. Preserve any formatting or punctuation.`;

const TRANSLATE_BATCH_PROMPT = (language: string) =>
  `You are a translator. You will receive a JSON array of text segments.
These segments, when concatenated in order, form a coherent piece of text.
Translate the combined text to ${language} as a whole, ensuring correct grammar, then split your translation back into the same number of segments.
Each translated segment must correspond to the meaning of its original segment.
If a segment is only whitespace or punctuation, keep it as-is.
Return ONLY a JSON array of the translated strings in the same order and same length.
No explanation, no markdown fences, just the JSON array.`;

const AGENT_SYSTEM_PROMPT = `You are Drafts AI, a helpful assistant built into Drafts.io, a writing platform where users create, share, and discover written drafts.

You can help users manage their drafts and explore content on the platform using the tools available to you.

## What you can do
- Search and retrieve the user's own drafts
- Search and retrieve public drafts from other users
- Create new drafts on the user's behalf, including full written content
- Update existing drafts (title, intro, topics — content is not editable via update)
- Delete drafts

## Privacy rules
- You can only create, update, or delete drafts that belong to the currently authenticated user
- You can read any public draft, but never private drafts from other users
- Never reveal or discuss passwords, authentication tokens, or any security-sensitive information
- Do not disclose personal information about other users beyond what is publicly visible on their profile

## Navigation
The app uses the following URL structure:
- View a draft: /app/drafts/{id}

Whenever you mention a specific draft in text, always link to it using markdown: [Draft Title](/app/drafts/{id})

When you call get_my_drafts, get_public_drafts, or get_draft, the results are automatically displayed as interactive cards in the UI showing title, topics, date, and word count. Do NOT re-list the draft details in your text response — just briefly acknowledge the results (e.g. "Here are your drafts:" or "Found 2 drafts."). Avoid repeating titles, topics, dates, or word counts since the cards already show them. Results are capped at 5 — if the user needs more, suggest they use search to narrow down.

## Behavior guidelines
- Always ask for explicit confirmation before deleting a draft — this action is irreversible
- When performing actions, briefly confirm what you did and include relevant details like draft title or ID
- If asked to do something you cannot do, explain why clearly
- Answer general questions about writing and the platform helpfully

## Images and cover
Before creating a draft, always call \`search_images\` to find relevant photos.
- Use one image URL as the \`cover\` of the draft.
- Embed 1–3 images inside \`content_markdown\` at natural points using \`![description](url)\`.

## Writing content
Always populate \`content_markdown\` when creating a draft — a draft without content is not useful.
Write a well-structured piece that covers the topic meaningfully. Use standard markdown:
- Headings: # H1, ## H2, ### H3
- Bold: **text**, Italic: *text*
- Bullet lists: - item, Ordered lists: 1. item
- Inline code: \`code\`, Code blocks: \`\`\`language
- Blockquotes: > text
- Horizontal rules: ---
- Links: [text](url)

Pass \`content_markdown: ""\` (empty string) only if the user explicitly requests a blank draft.`;

const AGENT_TOOLS: Anthropic.Tool[] = [
  {
    name: 'get_my_drafts',
    description:
      "Fetch the current user's draft library. Returns a list of drafts with their id, title, intro, topics, and creation date.",
    input_schema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Optional search query to filter drafts by title',
        },
      },
    },
  },
  {
    name: 'get_draft',
    description:
      "Fetch a specific draft by ID. Works for the user's own drafts or any public draft.",
    input_schema: {
      type: 'object',
      properties: {
        draftId: {
          type: 'string',
          description: 'The ID of the draft to fetch',
        },
      },
      required: ['draftId'],
    },
  },
  {
    name: 'get_public_drafts',
    description: 'Fetch public drafts from all users on the platform.',
    input_schema: {
      type: 'object',
      properties: {
        search: {
          type: 'string',
          description: 'Optional search query to filter drafts by title',
        },
      },
    },
  },
  {
    name: 'create_draft',
    description: 'Create a new draft for the current user.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'The title of the draft' },
        intro: {
          type: 'string',
          description: 'A short introduction or description',
        },
        topics: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of topics or tags for the draft',
        },
        content_markdown: {
          type: 'string',
          description:
            'Full draft content written in markdown. Always provide this. Pass an empty string only if the user explicitly requests a blank draft.',
        },
        cover: {
          type: 'string',
          description:
            'URL of the cover image. Use a URL returned by search_images. Always set a cover when creating a draft.',
        },
      },
      required: ['title', 'content_markdown', 'cover'],
    },
  },
  {
    name: 'search_images',
    description:
      'Search Unsplash for high-quality royalty-free photos. Returns image URLs you can embed in draft content or use as the cover. Call this before create_draft to get relevant images.',
    input_schema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search keywords describing the images you need (e.g. "tokyo japan city skyline")',
        },
        count: {
          type: 'number',
          description: 'Number of images to return (1-5, default 3)',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'update_draft',
    description:
      'Update an existing draft belonging to the current user. Only include fields you want to change.',
    input_schema: {
      type: 'object',
      properties: {
        draftId: {
          type: 'string',
          description: 'The ID of the draft to update',
        },
        title: { type: 'string', description: 'New title' },
        intro: {
          type: 'string',
          description: 'New introduction or description',
        },
        topics: {
          type: 'array',
          items: { type: 'string' },
          description: 'New list of topics or tags',
        },
      },
      required: ['draftId'],
    },
  },
  {
    name: 'delete_draft',
    description:
      'Delete a draft belonging to the current user. This is irreversible — only call this after the user has explicitly confirmed.',
    input_schema: {
      type: 'object',
      properties: {
        draftId: {
          type: 'string',
          description: 'The ID of the draft to delete',
        },
      },
      required: ['draftId'],
    },
  },
];

type ChatMessage = { role: 'user' | 'assistant'; content: string };

@Injectable()
export class AiService {
  private anthropic: Anthropic;

  constructor(
    private readonly draftsService: DraftsService,
    private readonly contentService: ContentService,
  ) {
    this.anthropic = new Anthropic();
  }

  async chat(messages: ChatMessage[], userId: string, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const emit = (event: Record<string, unknown>) =>
      res.write(`data: ${JSON.stringify(event)}\n\n`);

    const anthropicMessages: Anthropic.MessageParam[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      let continueLoop = true;

      while (continueLoop) {
        const stream = this.anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 8096,
          system: AGENT_SYSTEM_PROMPT,
          tools: AGENT_TOOLS,
          messages: anthropicMessages,
        });

        stream.on('text', (chunk) => emit({ type: 'text', text: chunk }));

        // Emit tool_start as soon as Claude announces a tool call, before
        // finalMessage() resolves. This eliminates the blank loading gap.
        const earlyToolIds = new Set<string>();
        // content_block_start exists at runtime but is absent from the
        // ParsedT generic — suppress unsafe-* for this one call only.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (stream as any).on(
          'content_block_start',
          (event: Anthropic.RawContentBlockStartEvent) => {
            if (event.content_block.type === 'tool_use') {
              const block =
                event.content_block as unknown as Anthropic.ToolUseBlock;
              earlyToolIds.add(block.id);
              emit({
                type: 'tool_start',
                toolId: block.id,
                tool: block.name,
                input: {},
              });
            }
          },
        );

        const finalMessage = await stream.finalMessage();

        anthropicMessages.push({
          role: 'assistant',
          content: finalMessage.content,
        });

        if (finalMessage.stop_reason === 'tool_use') {
          const toolUseBlocks = finalMessage.content.filter(
            (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use',
          );

          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const toolUse of toolUseBlocks) {
            // Update the card with the full input now that we have it,
            // or do a fresh tool_start if it was never announced early.
            if (earlyToolIds.has(toolUse.id)) {
              emit({
                type: 'tool_input',
                toolId: toolUse.id,
                input: toolUse.input,
              });
            } else {
              emit({
                type: 'tool_start',
                toolId: toolUse.id,
                tool: toolUse.name,
                input: toolUse.input,
              });
            }

            try {
              const result = await this.executeTool(
                toolUse.name,
                toolUse.input as Record<string, any>,
                userId,
              );
              emit({
                type: 'tool_result',
                toolId: toolUse.id,
                tool: toolUse.name,
                result,
              });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: JSON.stringify(result),
              });
            } catch (err) {
              const message =
                err instanceof Error ? err.message : 'Tool execution failed';
              emit({
                type: 'tool_result',
                toolId: toolUse.id,
                tool: toolUse.name,
                error: message,
              });
              toolResults.push({
                type: 'tool_result',
                tool_use_id: toolUse.id,
                content: `Error: ${message}`,
                is_error: true,
              });
            }
          }

          anthropicMessages.push({ role: 'user', content: toolResults });
        } else {
          continueLoop = false;
        }
      }
    } catch {
      emit({
        type: 'error',
        message: 'Something went wrong. Please try again.',
      });
    }

    emit({ type: 'done' });
    res.end();
  }

  private async executeTool(
    name: string,
    input: Record<string, any>,
    userId: string,
  ): Promise<unknown> {
    switch (name) {
      case 'get_my_drafts':
        return this.draftsService.getMyLibrary(
          input.search as string | undefined,
          userId,
          { take: 5, cursor: null },
        );
      case 'get_draft':
        return this.draftsService.findOneDraft(input.draftId as string, userId);
      case 'get_public_drafts':
        return this.draftsService.getDrafts(
          input.search as string | undefined,
          userId,
          { take: 5, cursor: null },
        );
      case 'create_draft': {
        const contentMarkdown = (
          input.content_markdown as string | undefined
        )?.trim();
        return this.draftsService.createDraft(
          {
            title: input.title as string,
            intro: input.intro as string | undefined,
            topics: (input.topics as string[] | undefined) ?? [],
            cover: input.cover as string | undefined,
            ...(contentMarkdown
              ? {
                  content:
                    this.contentService.markdownToTiptap(contentMarkdown),
                }
              : {}),
          },
          userId,
        );
      }
      case 'search_images':
        return this.searchImages(
          input.query as string,
          Math.min(Number(input.count) || 3, 5),
        );
      case 'update_draft':
        return this.draftsService.updateDraft(
          input.draftId as string,
          {
            title: input.title as string | undefined,
            intro: input.intro as string | undefined,
            topics: input.topics as string[] | undefined,
          } as any,
          userId,
        );
      case 'delete_draft':
        return this.draftsService.deleteDraft(input.draftId as string);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Image search
  // ---------------------------------------------------------------------------

  private async searchImages(
    query: string,
    count: number,
  ): Promise<Array<{ url: string; alt: string; photographer: string }>> {
    const key = process.env.UNSPLASH_ACCESS_KEY;
    if (!key) return [];

    const url =
      `https://api.unsplash.com/search/photos` +
      `?query=${encodeURIComponent(query)}` +
      `&per_page=${count}` +
      `&orientation=landscape`;

    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${key}` },
    });

    if (!res.ok) return [];

    const data = (await res.json()) as {
      results: Array<{
        urls: { regular: string };
        alt_description: string | null;
        user: { name: string };
      }>;
    };

    return data.results.map((photo) => ({
      url: photo.urls.regular,
      alt: photo.alt_description ?? query,
      photographer: photo.user.name,
    }));
  }

  // ---------------------------------------------------------------------------
  // Translation (unchanged)
  // ---------------------------------------------------------------------------

  async translate(text: string, language: string): Promise<string> {
    this.validateInput(text, language);

    try {
      const message = await this.anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: TRANSLATE_TEXT_PROMPT(language),
        messages: [{ role: 'user', content: text }],
      });

      const block = message.content[0];
      return block.type === 'text' ? block.text.trim() : '';
    } catch (error) {
      handleHttpError(error, 'Translation failed');
    }
  }

  async translateStream(text: string, language: string, res: Response) {
    this.validateInput(text, language);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
      const stream = this.anthropic.messages.stream({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        system: TRANSLATE_TEXT_PROMPT(language),
        messages: [{ role: 'user', content: text }],
      });

      stream.on('text', (chunk) => {
        res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
      });

      await stream.finalMessage();
      res.write('data: [DONE]\n\n');
      res.end();
    } catch {
      res.write(`data: ${JSON.stringify({ error: 'Translation failed' })}\n\n`);
      res.end();
    }
  }

  async translateBatch(texts: string[], language: string): Promise<string[]> {
    if (!texts?.length || !language) {
      throw new BadRequestException('Texts and language are required');
    }

    const maxRetries = 3;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const message = await this.anthropic.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 4096,
          temperature: 0,
          system: TRANSLATE_BATCH_PROMPT(language),
          messages: [{ role: 'user', content: JSON.stringify(texts) }],
        });

        const block = message.content[0];
        if (block.type === 'text') {
          const raw = block.text
            .trim()
            .replace(/^```(?:json)?\n?|\n?```$/g, '');
          return JSON.parse(raw) as string[];
        }

        return texts;
      } catch (error) {
        const status = (error as Record<string, unknown>)?.status as
          | number
          | undefined;
        const isRetryable =
          status === 429 ||
          status === 529 ||
          (status !== undefined && status >= 500);

        if (isRetryable && attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
          continue;
        }

        handleHttpError(error, 'Batch translation failed');
      }
    }

    return texts;
  }

  private validateInput(text: string, language: string) {
    if (!text || !language) {
      throw new BadRequestException('Text and language are required');
    }
  }
}
