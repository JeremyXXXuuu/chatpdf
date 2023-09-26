"use client";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { useSession, signIn, signOut } from "next-auth/react";
import type { NextAuthOptions } from "next-auth";

export default function Home() {
  const { data: session } = useSession();
  return (
    <>
      {session ? (
        <div>
          {JSON.stringify(session, null, 2)}
          <h1>Hello {session.user?.name}</h1>
          {/* <button onClick={() => signOut({ callbackUrl: SIGNOUT_URL })}> Sign Out</button>{" "} */}
          <Button onClick={() => signOut()}> Sign out</Button>
        </div>
      ) : (
        <div>
          <h1>Please Login</h1>
          <Button onClick={() => signIn()}> Sign In</Button>{" "}
        </div>
      )}
      {/* <FileUpload /> */}
    </>
  );
}
