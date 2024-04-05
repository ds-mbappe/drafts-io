import Document from "../../../models/Document";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { id } = params

  try {
    const documents = await Document.find({ creator_id: id })

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}