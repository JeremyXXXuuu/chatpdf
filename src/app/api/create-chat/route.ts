import { loadS3IntoPinecone } from "@/lib/pinecone";
import { NextResponse } from "next/server";

export async function POST(req: Request, res: Response) {
  try {
    const body = await req.json();
    const { file_key, file_name } = body;
    const document = await loadS3IntoPinecone(file_key);
    return NextResponse.json({
      document,
      file_name,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.error();
  }
}
