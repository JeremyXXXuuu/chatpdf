import { NextRequest, NextResponse } from "next/server";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

type MySession = Session & {
  user: {
    id: string;
  };
};

export async function auth(): Promise<{ user: any; userId: string }> {
  try {
    const session = await getServerSession(authOptions);
    const user = (session as MySession)!.user;
    const userId = (session as MySession)!.user!.id;
    return { user, userId };
  } catch (error) {
    console.error(error);
    throw new Error("Error in auth");
  }
}
