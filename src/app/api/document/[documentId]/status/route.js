import Document from "../../../../models/Document";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { documentId } = params

  try {
    const document = await Document.findById(documentId)

    if (document) {
      return NextResponse.json({ private: document?.private, password: document?.encrypted_password }, { status: 200 });
    } else {
      return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}