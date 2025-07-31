import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../backend/prisma/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const followData = body.isFollowing
    
    const data = await prisma.follows.findFirst({
      where: {
        followerId: followData?.followerId,
        followingId: followData?.followingId
      }
    })

    return NextResponse.json({ isFollowing: data ? true : false }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}