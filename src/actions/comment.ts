'use server'

import prisma from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

const commentSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  from: true,
  to: true,
  text: true,
  user: {
    select: {
      id: true,
      avatar: true,
      lastname: true,
      firstname: true,
    }
  }
}

export async function getDocumentComments(documentId: string) {
  try {
    const comments = await prisma.comment.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
      select: commentSelect,
    });

    return { success: true, comments };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

export async function getCommentById(id: string) {
  try {
    const comment = await prisma.comment.findUnique({
    where: { id },
    select: commentSelect,
  });

    return { success: true, comment };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

export async function createComment({
  documentId,
  userId,
  text,
  from,
  to,
}: {
  documentId: string,
  userId: string,
  text: string,
  from: number,
  to: number,
}) {
  try {    
    const comment = await prisma.comment.create({
      data: {
        text,
        documentId,
        userId,
        from,
        to,
      },
      select: commentSelect,
    });
  
    revalidatePath(`/documents/${documentId}`);
  
    return { success: true, comment };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

export async function updateComment({
  id,
  text,
}: {
  id: string
  text: string
}) {
  try {
    const updatedComment = await prisma.comment.update({
      where: { id },
      data: { text },
      select: commentSelect
    });
    
    return { success: true, comment: updatedComment };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

export async function deleteComment(id: string | undefined) {
  try {
    const comment = await prisma.comment.findUnique({ where: { id } });

    if (!comment) throw new Error("Comment not found")

    await prisma.comment.delete({ where: { id } })

    revalidatePath(`/documents/${comment.documentId}`)

    return { success: true, message: 'Comment deleted.' };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}
