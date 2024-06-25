import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET() {
  // Immediately respond
  const response = NextResponse.json({ message: "Initial response" });

  // Simulate a long-running task asynchronously (does not block the initial response)
  (async () => {
    await new Promise((resolve) => setTimeout(resolve, 20000)); // 70 seconds delay
    console.log("Long-running task completed");
  })();

  return response;
}
