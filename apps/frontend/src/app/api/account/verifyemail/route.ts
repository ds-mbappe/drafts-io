import { prisma } from "../../../backend/prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // It extracts the token property from the JSON body of the incoming request.
    const reqBody = await request.json()
    const { token } = reqBody

    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
      }
    })

    if(!user){
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Update user properties and save the changes
    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        isVerified: true,
        verifyToken: undefined,
        verifyTokenExpiry: undefined,
      }
    })

    return NextResponse.json({
      message: "Email Verified successfully",
      success: true
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}