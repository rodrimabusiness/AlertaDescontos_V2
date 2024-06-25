import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 5000)); // 5 seconds delay
  return NextResponse.json({ message: "Hello from API after 5 seconds" });
}
