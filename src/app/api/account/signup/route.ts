import bcryptjs from "bcryptjs";
import User from "../../../models/User";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/app/_helpers/mailer";

export async function POST(request: NextRequest){
// Defines an asynchronous POST request handler.
  try {
    const reqBody = await request.json()

    // Parses the request body to extract username, email, and password.
    const { username, email, password } = reqBody

    // Checks if a user with the provided email already exists. 
    const user = await User.findOne({ email })

    // If yes, returns a 400 response.
    if(user){
      return NextResponse.json({ error: "A user with this email already exists !" }, { status: 400 })
    }

    // Hash password using bcryptjs.
    const salt = await bcryptjs.genSalt(10)
    const hashedPassword = await bcryptjs.hash(password, salt)

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    })

    // Saves the new user to the database.
    const savedUser = await newUser.save()

    await sendEmail({
      email,
      emailType: "VERIFY",
      userId: savedUser._id
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