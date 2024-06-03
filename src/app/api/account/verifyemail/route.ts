import User from "@/app/models/User";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // It extracts the token property from the JSON body of the incoming request.
    const reqBody = await request.json()
    const { token } = reqBody

    const user = await User.findOne({ verifyToken: token, verifyTokenExpiry: { $gt: Date.now() } });

    if(!user){
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Update user properties and save the changes
    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({
      message: "Email Verified successfully",
      success: true
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}