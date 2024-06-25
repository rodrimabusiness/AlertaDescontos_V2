import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET() {
  await new Promise((resolve) => setTimeout(resolve, 30000)); // 30 seconds delay
  return NextResponse.json({ message: "Hello from API after 30 seconds" });
}
