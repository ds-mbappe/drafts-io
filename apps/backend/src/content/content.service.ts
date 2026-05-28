import { Injectable } from '@nestjs/common';
import { defaultMarkdownParser } from 'prosemirror-markdown';

const NODE_TYPE_MAP: Record<string, string> = {
  bullet_list: 'bulletList',
  ordered_list: 'orderedList',
  list_item: 'listItem',
  code_block: 'codeBlock',
  hard_break: 'hardBreak',
  horizontal_rule: 'horizontalRule',
};

const MARK_TYPE_MAP: Record<string, string> = {
  code: 'code',
  em: 'italic',
  strong: 'bold',
  link: 'link',
};

// Node types whose children are inline (text, images, hardBreak, etc.)
// rather than block-level nodes.
const INLINE_CONTENT_NODES = new Set([
  'heading',
  'paragraph',
  'code_block',
  'codeBlock',
]);

@Injectable()
export class ContentService {
  markdownToTiptap(markdown: string): Record<string, unknown> {
    const doc = defaultMarkdownParser.parse(markdown);
    if (!doc) return this.emptyDoc();
    const raw = doc.toJSON() as Record<string, unknown>;
    return {
      type: 'doc',
      content: this.transformBlockArray(
        (raw.content as Record<string, unknown>[]) ?? [],
      ),
    };
  }

  private emptyDoc(): Record<string, unknown> {
    return { type: 'doc', content: [{ type: 'paragraph' }] };
  }

  // ── Block-level processing ────────────────────────────────────────────────

  /**
   * Transform an array of block nodes.
   * Paragraphs containing inline images are split so the images become
   * standalone imageUploader blocks (imageUploader is block-only).
   */
  private transformBlockArray(
    nodes: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    const result: Record<string, unknown>[] = [];

    for (const node of nodes) {
      const type = node.type as string;

      if (type === 'paragraph') {
        const inlineChildren = this.transformInlineArray(
          (node.content as Record<string, unknown>[]) ?? [],
        );

        if (inlineChildren.some((c) => c.type === 'imageUploader')) {
          result.push(...this.splitAtImages(inlineChildren));
        } else {
          result.push({ type: 'paragraph', content: inlineChildren });
        }
      } else {
        result.push(this.transformBlockNode(node));
      }
    }

    return result;
  }

  /** Transform a single block node, dispatching its children correctly. */
  private transformBlockNode(
    node: Record<string, unknown>,
  ): Record<string, unknown> {
    const type = node.type as string;
    const mappedType = NODE_TYPE_MAP[type] ?? type;
    const children = node.content as Record<string, unknown>[] | undefined;

    const content = Array.isArray(children)
      ? {
          content: INLINE_CONTENT_NODES.has(type)
            ? this.transformInlineArray(children)
            : this.transformBlockArray(children),
        }
      : {};

    return {
      type: mappedType,
      ...(node.attrs ? { attrs: node.attrs } : {}),
      ...content,
    };
  }

  // ── Inline-level processing ───────────────────────────────────────────────

  private transformInlineArray(
    nodes: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    return nodes.map((n) => this.transformInlineNode(n));
  }

  /**
   * Transform a single inline node.
   * ProseMirror `image` → tiptop-editor `imageUploader` (will be hoisted to block).
   */
  private transformInlineNode(
    node: Record<string, unknown>,
  ): Record<string, unknown> {
    const type = node.type as string;

    if (type === 'image') {
      const attrs = (node.attrs ?? {}) as Record<string, unknown>;
      return {
        type: 'imageUploader',
        attrs: {
          src: attrs.src ?? null,
          id: Math.random().toString(36).slice(2, 10),
          uploading: false,
          progress: 100,
          selectMedia: false,
          failed: false,
          errorMessage: null,
        },
      };
    }

    return {
      type: NODE_TYPE_MAP[type] ?? type,
      ...(node.attrs ? { attrs: node.attrs } : {}),
      ...(node.text !== undefined ? { text: node.text } : {}),
      ...(Array.isArray(node.marks)
        ? {
            marks: (node.marks as Record<string, unknown>[]).map((m) =>
              this.transformMark(m),
            ),
          }
        : {}),
    };
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Split a mixed inline array into block segments:
   * runs of non-image nodes become paragraphs; images become imageUploader blocks.
   */
  private splitAtImages(
    nodes: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    const blocks: Record<string, unknown>[] = [];
    let run: Record<string, unknown>[] = [];

    for (const node of nodes) {
      if (node.type === 'imageUploader') {
        if (run.length > 0) {
          blocks.push({ type: 'paragraph', content: run });
          run = [];
        }
        blocks.push(node);
      } else {
        run.push(node);
      }
    }

    if (run.length > 0) blocks.push({ type: 'paragraph', content: run });

    return blocks;
  }

  private transformMark(
    mark: Record<string, unknown>,
  ): Record<string, unknown> {
    const type = mark.type as string;
    return {
      type: MARK_TYPE_MAP[type] ?? type,
      ...(mark.attrs ? { attrs: mark.attrs } : {}),
    };
  }
}
