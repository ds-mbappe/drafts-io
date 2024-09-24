import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(req, { params }) {
  try {
    // const { search } = params
    const search = req?.nextUrl?.searchParams.get("search")
    
    let documents = null

    if (search) {
      documents = await prisma.document.findMany({
        where: {
          title: search
        }
      })
    } else {
      documents = await prisma.document.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        where: {
          private: false
        }
      })
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
    
    const document = await prisma.document.create({
      data: documentData
    })

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const documentData = body.formData

    const document = await prisma.document.update({
      where: {
        id: documentData?.id,
      },
      data: { ...documentData },
    })

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}