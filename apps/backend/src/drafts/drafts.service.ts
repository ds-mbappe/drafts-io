import { Injectable } from '@nestjs/common';
import { prisma } from 'prisma/client';
import { UpdateDraftDto } from './dto/update-draft.dto';
import type { Document } from '@prisma/client';

@Injectable()
export class DraftsService {
  constructor() {}

  async getDrafts(search?: string, userId?: string) {
    const select = {
      id: true,
      author: {
        select: {
          id: true,
          avatar: true,
          lastname: true,
          firstname: true,
        },
      },
      cover: true,
      title: true,
      topic: true,
      intro: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      word_count: true,
      private: false,
      locked: false,
      character_count: false,
      authorId: false,
      _count: {
        select: {
          Comment: true,
          likes: true,
        },
      },
    };

    let documents: Document[] = [];

    if (search) {
      documents = await prisma.document.findMany({
        where: {
          title: search,
          private: false,
        },
        select: select,
      });
    } else {
      documents = await prisma.document.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        where: {
          private: false,
        },
        select: select,
      });
    }

    const likedDocs = await prisma.like.findMany({
      where: {
        userId,
        documentId: { in: documents.map((d) => d.id) },
      },
      select: { documentId: true },
    });

    const likedSet = new Set(likedDocs.map((d) => d.documentId));

    return documents.map((doc) => ({
      ...doc,
      hasLiked: likedSet.has(doc.id),
    }));
  }

  async updateDraft(dto: UpdateDraftDto) {
    // const { id, ...data } = dto;
    // return prisma.document.update({
    //   where: { id },
    //   data,
    // });
  }
}
