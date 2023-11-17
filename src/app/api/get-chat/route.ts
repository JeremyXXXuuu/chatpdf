import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "edge";

export const POST = async (req: Request) => {
  // console.log("get-chat");
  const { userId } = await req.json();
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  return NextResponse.json(_chats);
};
