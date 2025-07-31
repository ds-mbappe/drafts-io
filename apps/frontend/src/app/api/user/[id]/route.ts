import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../backend/prisma/client";

export async function GET(req: NextRequest, { params } : { params: { id: string } }) {
  const { id } = params

  try {
    const user = await prisma.user.findFirst({
      where:  {
        id: id,
      }
    });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const userData = body.formData

    const user = await prisma.user.update({
      where: {
        id: userData?.id,
      },
      data: { ...userData }
    })

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}