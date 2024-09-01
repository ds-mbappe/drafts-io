import Topic from "../../models/Topic";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const topics = await Topic.find({});

    return NextResponse.json({ topics }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Error", error }, { status: 500 });
  }
}

export async function POST(req) {
    try {
      const body = await req.json();
      const topicData = body.formData
      
      const topic = await Document.create(topicData)
  
      return NextResponse.json({ topic }, { status: 201 });
    } catch (error) {
      return NextResponse.json({ message: "Error", error }, { status: 500 });
    }
  }