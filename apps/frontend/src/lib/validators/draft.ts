import { z } from "zod";

export const CreateDraftSchema = z.object({
  authorId: z.string(),
  title: z.string().min(1, "Please fill the Draft title !"),
  cover: z.string().nullable().optional(),
  topics: z.array(z.string()).nullable().optional(),
  intro: z.string().nullable().optional(),
  content: z.record(z.string(), z.any()).nullable().optional(),
  word_count: z.number().nullable().optional(),
  character_count: z.number().nullable().optional(),
});
