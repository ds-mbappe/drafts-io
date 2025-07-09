"use server"

import prisma from "../../lib/prisma"

const createDocument = async (formData: {
  title: string;
  cover?: string | null;
  content?: string;
  word_count?: number;
  character_count?: number;
}) => {
  try {
    const document = await prisma.document.create({
      data: formData
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

const deleteDocument = async (documentId: String) => {
  const res = await fetch(`/api/document/${documentId}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
  })

  return res;
}

export { createDocument, getDocument, deleteDocument }
