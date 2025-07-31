import { NextRequest, NextResponse } from "next/server";
import { prisma } from '../../../../../backend/prisma/client';

export async function GET(req: NextRequest, { params } : { params: {} }) {
  try {
    // const { search } = params
    const search = req?.nextUrl?.searchParams.get("search")
    const userId: string | undefined = req?.nextUrl?.searchParams.get("userId") ?? undefined;
    
    let documents = null

    const select = {
      id: true,
      author: {
        select: {
          id: true,
          avatar: true,
          lastname: true,
          firstname: true,
        }
      },
      cover: true,
      title: true,
      topic: true,
      intro: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      word_count: true,
      _count: {
        select: {
          Comment: true,
          likes: true,
        }
      }
    }

    if (search) {
      documents = await prisma.document.findMany({
        where: {
          title: search,
          private: false,
        },
        select: select
      })
    } else {
      documents = await prisma.document.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        where: {
          private: false
        },
        select: select
      })
    }
    const likedDocs = await prisma.like.findMany({
      where: {
        userId: userId,
        documentId: { in: documents.map(d => d.id) }
      },
      select: { documentId: true }
    });
    const likedSet = new Set(likedDocs.map(d => d.documentId));

    documents = documents.map(doc => ({
      ...doc,
      hasLiked: likedSet.has(doc.id),
      commentCount: doc._count.Comment
    }));

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.log(error)
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

// export async function POST(req) {
//   try {
//     const body = await req.json();
//     const documentData = body.formData
    
//     const document = await prisma.document.create({
//       data: documentData
//     })

//     return NextResponse.json({ document }, { status: 201 });
//   } catch (error) {
//     return NextResponse.json({ message: "Error", error }, { status: 500 });
//   }
// }

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const documentData = body.formData

    const document = await prisma.document.update({
      where: {
        id: documentData?.id,
      },
      data: { ...documentData },
    })

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}