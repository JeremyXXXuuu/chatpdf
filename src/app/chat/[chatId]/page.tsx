import React from "react";
import { redirect } from "next/navigation";
import { Session, getServerSession } from "next-auth";
import Loading from "@/app/loading";

import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import Chat from "@/components/Chat";
import { chats } from "@/lib/db/schema";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
type Props = {
  params: {
    chatId: string;
  };
};

type MySession = Session & {
  user: {
    id: string;
  };
};

const ChatPage = async ({ params: { chatId } }: Props) => {
  const session = await getServerSession(authOptions);
  const userId = (session as MySession).user?.id;
  console.log("userId", userId);
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) return redirect("/");

  if (!_chats.find((chat) => chat.id === parseInt(chatId))) {
    return redirect("/");
  }

  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));

  return (
    <>
      {session ? (
        <div className="flex h-screen">
          <div className="flex w-full h-full">
            <div className="flex-[2] h-full overflow-auto">
              <ChatSideBar
                chatId={parseInt(chatId)}
                chats={_chats}
                isPro={true}
              />
            </div>
            <div className="flex-[5] h-full ">
              <PDFViewer pdf_url={currentChat?.pdfUrl!} />
            </div>
            <div className="flex-[3] h-full overflow-auto">
              <Chat chatId={chatId} />
            </div>
          </div>
        </div>
      ) : (
        redirect("/")
      )}
      {/* <FileUpload /> */}
    </>
  );
};

export default ChatPage;
