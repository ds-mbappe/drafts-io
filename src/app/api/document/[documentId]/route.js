import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(req, { params }) {
  const { documentId } = await params

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId
      }
    })

    return NextResponse.json({ document }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { documentId } = await params;
    const body = await req.json();
    const documentData = body.formData
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId
      },
      data: { ...documentData },
      select: {
        id: true,
        content: true,
        cover: true,
        title: true,
        authorFirstname: true,
        authorLastname: true,
        authorAvatar: true,
        authorId: true,
        private: true,
        createdAt: true,
        topic: true,
      }
    });

    return NextResponse.json({ updatedDocument }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
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