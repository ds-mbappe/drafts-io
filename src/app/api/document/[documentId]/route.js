import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function GET(req, { params }) {
  const { documentId } = params

  try {
    const document = await prisma.document.findFirst({
      where: {
        id: documentId
      }
    })

    if (document) {
      return NextResponse.json({ document }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { documentId } = params;
    const body = await req.json();
    const updatedDocument = await prisma.document.update({
      where: {
        id: documentId
      },
      data: { ...body }
    });

    return NextResponse.json({ updatedDocument }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { documentId } = params;
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