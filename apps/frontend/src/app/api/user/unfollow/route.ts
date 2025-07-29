import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@shared/prisma/client";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { followerId, followingId } = body

    const isFollowing = await prisma.follows.count({
      where: {
        followerId: followerId,
        followingId: followingId
      }
    });

    if (isFollowing) {
      const data = await prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId: followerId,
            followingId: followingId
          }
        }
      })
      console.log(data)
    }

    return NextResponse.json({ message: "User unfollowed." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}