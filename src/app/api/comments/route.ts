import { NextRequest, NextResponse } from 'next/server'
import prisma from '../../../../lib/prisma'

const commentSelect = {
  id: true,
  createdAt: true,
  updatedAt: true,
  text: true,
  user: {
    select: {
      avatar: true,
      lastname: true,
      firstname: true,
    }
  }
}

export async function GET(req: NextRequest) {
  const documentId = req.nextUrl.searchParams.get('documentId')

  if (!documentId) {
    return NextResponse.json({ error: 'Missing documentId' }, { status: 400 })
  }

  try {
    const comments = await prisma.comment.findMany({
      where: { documentId },
      orderBy: { createdAt: 'asc' },
      select: commentSelect,
    });

    return NextResponse.json({ comments }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error while fetching comments", error }, { status: 500 });
  }
}
