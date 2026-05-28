import { PartialType } from '@nestjs/mapped-types';
import { CreateDraftDto } from './create-draft.dto';

export class UpdateDraftDto extends PartialType(CreateDraftDto) {
  locked: boolean;
  private: boolean;
  cover: string;
  topics: string[];
  title: string;
  content?: Record<string, any> | null;
  intro: string;
  word_count: number;
  character_count: number;
  /** Base64-encoded Y.Doc state snapshot */
  ydoc?: string;
}
