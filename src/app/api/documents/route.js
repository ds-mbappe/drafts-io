import Document from "../../models/Document";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    // const { search } = params
    const search = req?.nextUrl?.searchParams.get("search")
    
    let documents = null

    // documents = await Document.find({
    //   private: false,
    // })

    if (search) {
      documents = await Document.find({
        $text: {
          $search: search,
        }
      })
    } else {
      documents = await Document.find({})
    }

    return NextResponse.json({ documents }, { status: 200 });
  } catch (error) {
    console.log(error)
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
      $set: { ...documentData },
    }, { new: true })

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}