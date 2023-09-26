import "./globals.css";
import type { Metadata } from "next";
import { NextAuthProvider } from "./nextAuthProvider";
import { Inter } from "next/font/google";
import Providers from "@/components/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat pdf",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <NextAuthProvider>
        <Providers>
          <body className={inter.className}>{children}</body>
        </Providers>
      </NextAuthProvider>
    </html>
  );
}
