import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import User from "../models/User";


export const sendEmail = async({ email, emailType, userId }:any) =>{
  try {
    // Create a hash token based on the user's ID
    const hashedToken = await bcrypt.hash(userId.toString(), 10)

    // Update the user document in the database with the generated token and expiry time
    if(emailType === "VERIFY") {
      await User.findByIdAndUpdate(userId,
        {
          verifyToken: hashedToken,
          verifyTokenExpiry: Date.now() + 3600000
        },
      )
    } else if(emailType === "RESET") {
      await User.findByIdAndUpdate(userId,
        {
          forgotPasswordToken: hashedToken,
          forgotPasswordTokenExpiry: Date.now() + 3600000
        },
      )
    }

    // Create a nodemailer transport
    var transport = nodemailer.createTransport({
      host: "smtp.resend.com",
      port: 465,
      auth: {
        user: process.env.RESEND_USERNAME,
        pass: process.env.RESEND_API_KEY
      }
    });

    // Compose email options
    const mailOptions = {
      from: 'no-reply@drafts-io.com',
      to: email,
      subject: emailType === "VERIFY" ? "Verify your email" : "Reset your password",
      html: `<p>Click <a href="${process.env.NEXTAUTH_URL}/account/verify-email?token=${hashedToken}">here</a> to 
      ${emailType === "VERIFY" ? "Verify your email" : "Reset your password"}</p>`
    }

    // Send the email
    const mailresponse = await transport.sendMail(mailOptions);
    return mailresponse
      
  } catch (error: any) {
    throw new Error(error.message);
  }
}