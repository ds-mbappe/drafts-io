import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { prisma } from 'prisma/client';
import { UpdateDraftDto } from './dto/update-draft.dto';
import type { Document } from '@prisma/client';

@Injectable()
export class DraftsService {
  constructor() {}

  async getDrafts(search?: string, userId?: string) {
    try {
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
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error retrieving drafts',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOneDraft(id: string, userId?: string) {
    try {
      const document = await prisma.document.findFirst({
        where: {
          id: id,
        },
        include: {
          author: {
            select: {
              id: true,
              avatar: true,
              lastname: true,
              firstname: true,
            },
          },
          _count: {
            select: {
              Comment: true,
              likes: true,
            },
          },
        },
      });

      const likedDocs = await prisma.like.findMany({
        where: {
          userId,
          documentId: id,
        },
        select: { documentId: true },
      });

      const likedSet = new Set(likedDocs.map((d) => d.documentId));

      return { ...document, hasLiked: likedSet.has(document.id) };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error retrieving draft',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateDraft(documentId: string, dto: UpdateDraftDto, userId?: string) {
    try {
      const updatedDocument = await prisma.document.update({
        where: {
          id: documentId,
        },
        data: { ...dto },
        include: {
          author: {
            select: {
              id: true,
              avatar: true,
              lastname: true,
              firstname: true,
            },
          },
          _count: {
            select: {
              Comment: true,
              likes: true,
            },
          },
        },
      });

      const likedDocs = await prisma.like.findMany({
        where: {
          userId,
          documentId: documentId,
        },
        select: { documentId: true },
      });

      const likedSet = new Set(likedDocs.map((d) => d.documentId));

      return { ...updatedDocument, hasLiked: likedSet.has(updatedDocument.id) };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error updating draft',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async toggleLike(documentId: string, userId: string) {
    try {
      // Check if the user has already liked the document
      const existingLike = await prisma.like.findFirst({
        where: {
          documentId: documentId,
          userId: userId,
        },
      });

      if (existingLike) {
        // Unlike: Remove the existing like
        await prisma.like.delete({
          where: {
            documentId_userId: {
              documentId: documentId,
              userId: userId,
            },
          },
        });

        return {
          liked: false,
          message: 'Document disliked successfully!',
        };
      } else {
        // Like: Create a new like
        await prisma.like.create({
          data: {
            documentId: documentId,
            userId: userId,
          },
        });

        return {
          liked: true,
          message: 'Document liked successfully!',
        };
      }
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error toggling like on the draft',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteDraft(id: string) {
    try {
      await prisma.document.delete({
        where: {
          id: id,
        },
      });

      return { mesage: 'Draft deleted successfully.' };
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error retrieving draft',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
