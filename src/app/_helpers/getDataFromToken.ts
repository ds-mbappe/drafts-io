import jwt from 'jsonwebtoken'
import { NextRequest } from "next/server"

export const getDataFromToken = (request: NextRequest) => {
  try {
    // Retrieve the token from the cookies
    const token = request.cookies.get("token")?.value || '';

    // Verify and decode the token using the secret key
    const decodedToken:any = jwt.verify(token, process.env.JWT_SECRET!);

    // Return the user ID from the decoded token
    return decodedToken.id;
  } catch (error: any) {
    throw new Error(error.message)
  }
}