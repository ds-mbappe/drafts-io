import Document from "../../../../models/Document";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { userId } = params
    const documents = await Document.find({
      holders_id: {
        $elemMatch: {
          $eq: userId
        }
      }
    })

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}