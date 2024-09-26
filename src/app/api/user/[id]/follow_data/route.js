import { NextResponse } from "next/server";
import prisma from '../../../../../../lib/prisma';

export async function GET(req, { params }) {
  const { id } = params

  try {
    const followers = await prisma.follows.count({
      where: {
        followingId: id,
      }
    });

    const following = await prisma.follows.count({
      where: {
        followerId: id,
      }
    });

    const followData = {
      followers_count: followers,
      following_count: following,
    }

    return NextResponse.json({ followData }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}