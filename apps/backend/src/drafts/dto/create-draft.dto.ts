export class CreateDraftDto {
  title: string;
  intro?: string;
  topics?: string[];
  cover?: string;
  content?: Record<string, any> | null;
  word_count?: number;
  character_count?: number;
}
