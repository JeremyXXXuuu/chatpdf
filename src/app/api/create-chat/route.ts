import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextRequest, NextResponse } from "next/server";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { getS3Url } from "@/lib/s3";

type MySession = Session & {
  user: {
    id: string;
  };
};

export async function POST(req: NextRequest, res: NextResponse) {
  const session = await getServerSession(authOptions);
  if (!session && !session!.user) return NextResponse.error();
  const userId = (session as MySession)!.user!.id;
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    console.log(file_key, file_name);
    const document = await loadS3IntoPinecone(file_key);
    const chat_id = await db
      .insert(chats)
      .values({
        fileKey: file_key,
        pdfName: file_name,
        pdfUrl: getS3Url(file_key),
        userId,
      })
      .returning({
        insertedId: chats.id,
      });
    return NextResponse.json(
      {
        chat_id: chat_id[0].insertedId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
