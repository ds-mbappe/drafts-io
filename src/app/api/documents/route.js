import Document from "../../models/Document";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    const { search } = params
    // const search = req?.nextUrl?.searchParams.get("search")
    
    let documents = null

    if (search) {
      documents = await Document.find({
        title: search,
        // $where: function() {
        //   return this.name.toLowerCase().startsWith(search)
        // }
      })
    } else {
      documents = await Document.find({})
    }

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

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

export async function PUT(req) {
  try {
    const body = await req.json();
    const documentData = body.formData

    const document = await Document.findOneAndUpdate({
      _id: documentData?.id,
    }, {
      $set: { name: documentData?.name, private: documentData?.private },
    }, { new: true })

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}