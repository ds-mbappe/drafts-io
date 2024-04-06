import Document from "../../models/Document";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();
    const documentData = body.formData

    const document = await Document.create(documentData)

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

// export async function GET(req, { params }) {
//   const { id } = params

//   try {
//     const documents = await Document.find()

//     return NextResponse.json({ documents }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ message: "Error", error }, { status: 500 });
//   }
// }