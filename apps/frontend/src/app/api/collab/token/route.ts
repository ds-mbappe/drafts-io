// /app/api/collab/token/route.ts
import { auth } from "@/auth"
import jwt from "jsonwebtoken"

export async function GET() {
  const session = await auth()
  
  if (!session || !session.user?.email) {
    return new Response("Unauthorized", { status: 401 })
  }
  
  const payload = {
    email: session.user.email,
    name: session.user.name,
  }
    
  const token = jwt.sign(
    payload,
    process.env.AUTH_SECRET!,
    { expiresIn: "15m" }
  )
    
  // Verify the token immediately to check if it's valid
  try {
    jwt.verify(token, process.env.AUTH_SECRET!)
  } catch (error) {
    console.error('[TOKEN] Token verification failed:', error)
  }

  return Response.json({ token })
}