"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { useSession, signIn, signOut } from "next-auth/react";
import type { NextAuthOptions, Session } from "next-auth";
import { useState } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { checkSubscription } from "@/lib/subscription";

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

  const { data: isPro } = useQuery({
    // queryKey: ["isPro", userId],
    queryFn: async () => {
      const res = await fetch("/api/check-subs", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      return res.json();
    },
  });
  console.log(isPro);

  // const [chats, isPro] = useQueries({
  //   queries: [
  //     {
  //       queryKey: ["chats", userId],
  //       queryFn: async () => {
  //         const res = await fetch("/api/get-chat", {
  //           method: "POST",
  //           body: JSON.stringify({ userId }),
  //         });
  //         return res.json();
  //       },
  //     },
  //     {
  //       queryKey: ["isPro", userId],
  //       queryFn: async () => {
  //         const res = await fetch("/api/check-subs", {
  //           method: "GET",
  //           body: JSON.stringify({ userId }),
  //         });
  //         return res.json();
  //       },
  //     },
  //   ],
  // });
  // console.log(isPro.data);
  // console.log(chats.data);
  //
  return (
    <>
      <div className="w-screen min-h-screen xlinear-gradient(to right, rgb(243, 244, 246), rgb(209, 213, 219))">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center">
              <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            </div>
            <div className="flex mt-2">
              {session && (
                <div className="flex gap-5">
                  <Avatar>
                    <AvatarImage src={`${session.user?.image}`} />
                    <AvatarFallback>{session.user?.name![0]}</AvatarFallback>
                  </Avatar>
                  {chats && chats[0] && (
                    <Link href={`/chat/${chats[0].id}`}>
                      <Button>
                        Go to Chats <ArrowRight className="ml-2" />
                      </Button>
                    </Link>
                  )}
                  <Button onClick={() => signOut()}> Sign out</Button>
                  {/* <div className="ml-3">
              <SubscriptionButton isPro={isPro} />
            </div> */}
                </div>
              )}
            </div>
            <p className="max-w-xl mt-1 text-lg text-slate-600">
              Anwer questions and understand research with AI
            </p>
            {session && session.user?.email ? (
              <div className="w-full mt-4">
                <h1>Hello {session.user?.name}</h1>
                <FileUpload />
                {/* <button onClick={() => signOut({ callbackUrl: SIGNOUT_URL })}> Sign Out</button>{" "} */}
              </div>
            ) : (
              <div className="mt-5">
                {" "}
                <Button onClick={() => signIn()}> Sign In</Button>{" "}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
