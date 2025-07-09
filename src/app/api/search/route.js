import { NextResponse } from "next/server";
import prisma from '../../../../lib/prisma';

export async function GET(req) {
  try {
    const search = req?.nextUrl?.searchParams.get("text")

    if (!search) {
      return NextResponse.json({ message: "Search parameter is required" }, { status: 400 });
    }

    if (search?.startsWith("@")) {
      const users = await prisma.user.findMany({
        take: 10,
        select: {
          avatar: true,
          username: true,
          lastname: true,
          firstname: true,
        },
        where: {
          username: {
            startsWith: search?.split("@")[1],
            mode: "insensitive",
          }
        }
      });
      return NextResponse.json({ users }, { status: 200 });
    } else {
      const [users, documents] = await Promise.all([
        prisma.user.findMany({
          take: 10,
          select: {
            avatar: true,
            username: true,
            lastname: true,
            firstname: true,
          },
          where: {
            OR: [
              {
                firstname: {
                  startsWith: search,
                  mode: "insensitive",
                },
              },
              {
                lastname: {
                  startsWith: search,
                  mode: "insensitive",
                },
              }
            ]
          }
        }),

        prisma.document.findMany({
          take: 10,
          select: {
            id: true,
            title: true,
            updatedAt: true,
          },
          where: {
            title: {
              startsWith: search,
              mode: "insensitive",
            },
            private: false
          }
        })
      ])

      return NextResponse.json({ users, documents }, { status: 200 });
    }
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}