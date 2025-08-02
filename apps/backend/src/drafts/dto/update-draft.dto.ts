import { PartialType } from '@nestjs/mapped-types';
import { CreateDraftDto } from './create-draft.dto';

export class UpdateDraftDto extends PartialType(CreateDraftDto) {
  // id: string;
  locked: boolean;
  private: boolean;
  // author: {
  //   id: string;
  //   avatar: string;
  //   lastname: string;
  //   firstname: string;
  // };
  // createdAt: string | null;
  // updatedAt: string | null;
  cover: string;
  topic: string;
  title: string;
  content: string | null;
  intro: string;
  word_count: number;
  // hasLiked: boolean;
  // _count: {
  //   Comment: number;
  //   likes: number;
  // };
}
