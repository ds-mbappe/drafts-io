import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/prisma/client";

export async function GET(req: NextRequest, { params } : { params: { userId: string } }) {
  try {
    const { userId } = params
    const search = req?.nextUrl?.searchParams.get("search")
    
    let documents = null

    if (search) {
      documents = await prisma.document.findMany({
        where: {
          authorId: userId,
        }
      })
    } else {
      documents = await prisma.document.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        where: {
          author: {
            followers: {
              some: {
                followerId: userId,
              }
            }
          },
          private: false
        }
      })
    }

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const documentData = body.formData

    const document = await prisma.document.update({
      where: {
        id: documentData?.id,
      },
      data: { ...documentData },
    });

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}