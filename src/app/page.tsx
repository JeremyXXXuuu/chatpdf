"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { useSession, signIn, signOut } from "next-auth/react";
import type { NextAuthOptions, Session } from "next-auth";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type MySession = Session & {
  user: {
    id: string;
  };
};
export default function Home() {
  const { data: session, status } = useSession();
  const userId = (session as MySession)?.user?.id;
  const { data: chats } = useQuery({
    queryKey: ["chats", userId],
    queryFn: async () => {
      const res = await fetch("/api/get-chat", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      return res.json();
    },
  });
  if (chats?.length) {
    console.log("chats", chats);
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
      </div>
      <div className="flex mt-2">
        {session && chats && chats[0] && (
          <>
            <Link href={`/chat/${chats[0].id}`}>
              <Button>
                Go to Chats <ArrowRight className="ml-2" />
              </Button>
            </Link>
            {/* <div className="ml-3">
              <SubscriptionButton isPro={isPro} />
            </div> */}
          </>
        )}
      </div>
      <p className="max-w-xl mt-1 text-lg text-slate-600">
        Anwer questions and understand research with AI
      </p>
      {session && session.user?.email ? (
        <div>
          {JSON.stringify(session, null, 2)}
          <h1>Hello {session.user?.name}</h1>
          <FileUpload />
          {/* <button onClick={() => signOut({ callbackUrl: SIGNOUT_URL })}> Sign Out</button>{" "} */}
          <Button onClick={() => signOut()}> Sign out</Button>
        </div>
      ) : (
        <div>
          <h1>Please Login</h1>
          <Button onClick={() => signIn()}> Sign In</Button>{" "}
        </div>
      )}
    </>
  );
}
