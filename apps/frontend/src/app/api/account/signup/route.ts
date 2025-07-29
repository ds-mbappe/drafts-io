import bcryptjs from "bcryptjs";
import prisma from "../../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/app/_helpers/email";

export async function POST(request: NextRequest){
// Defines an asynchronous POST request handler.
  try {
    const reqBody = await request.json()

    // Parses the request body to extract username, firstname, lastname, email, and password.
    const {
      email,
      username,
      password,
      firstname,
      lastname,
    } = reqBody

    // Checks if a user with the provided email already exists. 
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      }
    })

    // If yes, returns a 400 response.
    if(user){
      return NextResponse.json({ error: "A user with this email already exists !" }, { status: 400 })
    }

    // Hash password using bcryptjs.
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    // Saves the new user to the database.
    const savedUser = await prisma.user.create({
      data: {
        email,
        username,
        firstname,
        lastname,
        password: hashedPassword
      }
    })

    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: savedUser.id,
    })

    return NextResponse.json({
      message: "User created successfully",
      success: true,
      savedUser
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}