import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../backend/prisma/client";

export async function GET(req: NextRequest, { params } : { params: { documentId: string } }) {
  const { documentId } = await params

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId
      },
      include: {
        author: {
          select: {
            id: true,
            avatar: true,
            lastname: true,
            firstname: true,
          }
        }
      }
    })

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params } : { params: { documentId: string } }) {
  try {
    const { documentId } = await params;
    const body = await req.json();
    const documentData = body.formData
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId
      },
      data: { ...documentData },
      include: {
        author: {
          select: {
            id: true,
            avatar: true,
            lastname: true,
            firstname: true,
          }
        }
      }
    });

    return NextResponse.json({ updatedDocument }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params } : { params: { documentId: string } }) {
  try {
    const { documentId } = await params;
    const updatedDocument = await prisma.document.delete({
      where: {
        id: documentId
      }
    })

    return NextResponse.json({ updatedDocument }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}