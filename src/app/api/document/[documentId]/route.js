import Document from "../../../models/Document";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { documentId } = params

  try {
    const document = await Document.findById(documentId)

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
    const updatedDocument = await Document.findByIdAndUpdate(documentId, { ...body }, {
      new: true,
    });

    return NextResponse.json({ updatedDocument }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}