import bcryptjs from "bcryptjs";
import prisma from "../../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // Defines an asynchronous POST request handler.
  try {
    const reqBody = await request.json()

    // Parses the request body to extract username, email, and password.
    const { email, password } = reqBody

    // Check if user exists
    const user = await prisma.user.findFirst({
      omit: {
        password: false,
      },
      where: {
        email: email
      }
    })

    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 })
    }

    // Check if password is correct
    const validPassword = await bcryptjs.compare(password, user.password)
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid password" }, { status: 400 })
    }

    // Create a JSON response indicating successful login
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      user: user,
    })

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}