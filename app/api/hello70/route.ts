import { NextResponse } from "next/server";

export const maxDuration = 60;

export async function GET() {
  // Immediately respond
  const response = NextResponse.json({ message: "Initial response" });

  // Simulate a long-running task asynchronously (does not block the initial response)
  (async () => {
    await new Promise((resolve) => setTimeout(resolve, 70000)); // 70 seconds delay
    const response_2 = NextResponse.json({ message: "later response" });
  })();

  return response;
}
