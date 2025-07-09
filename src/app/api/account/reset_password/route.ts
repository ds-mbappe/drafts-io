import { sendEmail } from "@/app/_helpers/email";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import prisma from "../../../../../lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // It extracts the token property from the JSON body of the incoming request.
    const reqBody = await request.json()
    const { email, token, password } = reqBody

    const user = await prisma.user.findFirst({
      omit: {
        verifyToken: false,
        forgotPasswordToken: false,
      },
      where: {
        email: email,
      }
    });

    // If there is a token, then reset the password
    if (token) {
      const isTokenValid = String(token) === String(user?.forgotPasswordToken)

      if (isTokenValid) {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Update user properties and save the changes
        await prisma.user.update({
          where: {
            id: user?.id,
          },
          data: {
            password: hashedPassword,
            forgotPasswordToken: undefined,
            forgotPasswordTokenExpiry: undefined,
          }
        })

        return NextResponse.json({
          message: "Password reset successful.",
          success: true
        })
      } else {
        return NextResponse.json({ error: "Token invalid" }, { status: 400 })
      }
    }

    // If no token, just send the rest password email
    if(!user){
      return NextResponse.json({ error: "User not found" }, { status: 400 })
    }

    await prisma.user.update({
      where: {
        id: user?.id,
      },
      data: {
        forgotPasswordToken: String(user?.verifyToken),
        forgotPasswordTokenExpiry: new Date(),
      }
    })

    await sendEmail({
      email,
      emailType: "RESET",
      userId: user?.id
    })

    return NextResponse.json({
      message: "Reset password email sent successfully.",
      success: true
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}