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

export async function PUT(req) {
  try {
    const body = await req.json();
    const userData = body.formData

    const user = await User.findOneAndUpdate({
      _id: userData?.id,
    }, {
      $set: { ...userData },
    }, { new: true })

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}