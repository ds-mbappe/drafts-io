import { NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";

export async function POST(req) {
  try {
    const body = await req.json();
    const { followerId, followingId } = body
    
    await prisma.follows.create({
      data: {
        followerId: followerId,
        followingId: followingId
      }
    })

    return NextResponse.json({ followed: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}