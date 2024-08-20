import User from "../../../models/User";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { email } = params

  try {
    const user = await User.findOne({ email: email });

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}