"use client";
import React from "react";
import { redirect } from "next/navigation";
import { useSession } from "next-auth/react";
import { type Session } from "next-auth";
import Loading from "@/app/loading";

import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import Chat from "@/components/Chat";
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

const Page = ({ params: { chatId } }: Props) => {
  const { data: session, status, update } = useSession();
  //   console.log("session", session);
  //   console.log("status", status);
  if (status === "loading") return <Loading />;
  const userId = (session as MySession).user?.id;

  return (
    <>
      {session ? (
        <div className="flex h-screen">
          <div className="flex w-full h-full">
            <div className="flex-[1] h-full">
              <ChatSideBar chatId={123} chats={[]} isPro={true} />
            </div>
            <div className="flex-[5] h-full ">
              <PDFViewer pdf_url="file:///C:/Users/Oro-ltp20/Downloads/deposit-receipt.pdf" />
            </div>
            <div className="flex-[3] h-full overflow-auto">
              <Chat />
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

export default Page;
