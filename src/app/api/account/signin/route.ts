import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import User from "../../../models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest){
// Defines an asynchronous POST request handler.
  try {
    const reqBody = await request.json()

    // Parses the request body to extract username, email, and password.
    const { email, password } = reqBody

    // Check if user exists
    const user = await User.findOne({ email })

    if(!user){
      return NextResponse.json({ error: "User does not exist" }, { status: 400 })
    }

    // Check if password is correct
    const validPassword = await bcryptjs.compare(password, user.password)
    if(!validPassword){
      return NextResponse.json({ error: "Invalid password" }, { status: 400 })
    }

    //create token data
    // A JavaScript object (tokenData) is created to store essential user 
    // information. In this case, it includes the user's unique identifier (id), 
    // username, and email.
    const tokenData = {
      id: user._id,
      // username: user.username,
      email: user.email
    }

    // Create a token with expiration of 1 day
    const token = jwt.sign(tokenData, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN })

    // Create a JSON response indicating successful login
    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      user: user,
    })

    // Set the token as an HTTP-only cookie
    response.cookies.set("token", token, {})

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}