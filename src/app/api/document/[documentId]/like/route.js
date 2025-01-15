import { NextResponse } from "next/server";
import prisma from "../../../../../../lib/prisma";

// GET: Fetch the likes count for a specific document
export async function GET(req, { params }) {
  const { documentId } = params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ message: "User ID is required to check like status." }, { status: 400 });
  }

  try {
    // Use aggregate for likeCount and findFirst for hasLiked
    const [likeCount, userLike] = await Promise.all([
      // Get the like count
      prisma.like.count({
        where: { documentId },
      }),

      // Check if the user has liked the document
      prisma.like.findFirst({
        where: {
          documentId,
          userId,
        },
      }),
    ]);

    // Combine both results into a single response
    const hasLiked = !!userLike;

    return NextResponse.json({ likeCount: likeCount, hasLiked }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch like count.", error: error.message }, { status: 500 });
  }
}

// POST: Add a like to the document
export async function POST(req, { params }) {
  const { documentId } = params;

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required to like a document." }, { status: 400 });
    }

    // Check if the user has already liked the document
    const existingLike = await prisma.like.findFirst({
      where: {
        documentId: documentId,
        userId: userId,
      },
    });

    if (existingLike) {
      return NextResponse.json({ message: "You have already liked this document." }, { status: 400 });
    }

    // Create a new like
    const like = await prisma.like.create({
      data: {
        documentId: documentId,
        userId: userId,
      },
    });

    // Optionally, return the updated like count
    const likeCount = await prisma.like.count({
      where: { documentId: documentId },
    });

    return NextResponse.json({ message: "Document liked successfully!", like, likeCount }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to like the document.", error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a like from the document
export async function DELETE(req, { params }) {
  const { documentId } = params;

  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ message: "User ID is required to unlike a document." }, { status: 400 });
    }

    // Delete the like
    const deletedLike = await prisma.like.delete({
      where: {
        documentId_userId: {
          documentId: documentId,
          userId: userId,
        }
      },
    });

    // Optionally, return the updated like count
    const likeCount = await prisma.like.count({
      where: { documentId: documentId },
    });

    return NextResponse.json({ message: "Document disliked successfully!", likeCount }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to unlike the document.", error: error.message }, { status: 500 });
  }
}