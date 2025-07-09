import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

export async function GET(req, { params }) {
  try {
    const { userId } = await params
    const search = req?.nextUrl?.searchParams.get("search")
    
    let documents = null

    documents = await prisma.document.findMany({
      take: 10,
      orderBy: {
        createdAt: 'desc'
      },
      where: {
        authorId: userId,
      },
      select: {
        id: true,
        authorAvatar: true,
        authorFirstname: true,
        character_count: true,
        cover: true,
        createdAt: true,
        title: true,
        topic: true,
        word_count: true,
      }
    })

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}