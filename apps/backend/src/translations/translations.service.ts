import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class TranslationsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Upsert a translation — one per (draft, user, language). */
  async upsert(
    draftId: string,
    userId: string,
    language: string,
    content: Record<string, unknown>,
  ) {
    return this.prisma.draftTranslation.upsert({
      where: { draftId_userId_language: { draftId, userId, language } },
      create: {
        draftId,
        userId,
        language,
        content: content as Prisma.InputJsonValue,
      },
      update: { content: content as Prisma.InputJsonValue },
    });
  }

  /** All translations saved by a user for a given draft. */
  async findByDraft(draftId: string, userId: string) {
    return this.prisma.draftTranslation.findMany({
      where: { draftId, userId },
      select: { language: true, content: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /** Single translation for a specific language. */
  async findOne(draftId: string, userId: string, language: string) {
    return this.prisma.draftTranslation.findUnique({
      where: { draftId_userId_language: { draftId, userId, language } },
      select: { language: true, content: true, updatedAt: true },
    });
  }

  async delete(draftId: string, userId: string, language: string) {
    return this.prisma.draftTranslation.delete({
      where: { draftId_userId_language: { draftId, userId, language } },
    });
  }
}
