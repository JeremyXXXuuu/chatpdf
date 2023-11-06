import { checkSubscription } from "@/lib/subscription";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  console.log("check-subs");
  //   console.log(req.json());
  const { userId } = await req.json();
  const isSubscribed = await checkSubscription(userId);
  return NextResponse.json({ isSubscribed });
}
