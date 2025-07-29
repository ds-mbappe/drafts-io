"use server"

import { prisma } from "@shared/prisma/client";

const createDocument = async (formData: any) => {
  try {
    const document = await prisma.document.create({
      data: formData,
      include: {
        author: {
          select: {
            id: true,
            avatar: true,
            lastname: true,
            firstname: true,
          },
        },
      },
    });
    
    return { success: true, document };
  } catch (error: any) {
    return { success: false, error: error?.message };
  }
}

const getDocument = async (documentId: String) => {
  const res = await fetch(`/api/document/${documentId}`, {
    method: 'GET',
    headers: { "content-type": "application/json" },
  });

  return res;
}

export { createDocument, getDocument }
