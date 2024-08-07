import Document from "../../../models/Document";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { email } = params
    const search = req?.nextUrl?.searchParams.get("search")
    
    let documents = null

    if (search) {
      documents = await Document.find({
        creator_email: email,
        // $where: function() {
        //   return this.name.toLowerCase().startsWith(search)
        // }
      })
    } else {
      documents = await Document.find({
        creator_email: email
      })
    }

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}