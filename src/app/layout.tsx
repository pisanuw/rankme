import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RankMe — Vote for the Best",
  description: "Compare items head-to-head and see ELO-ranked leaderboards.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geist.className} min-h-screen bg-gray-950 text-gray-100`}
      >
        <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-bold tracking-tight hover:text-indigo-400 transition-colors"
          >
            RankMe
          </Link>
          <Link
            href="/topics/new"
            className="text-sm bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg transition-colors"
          >
            + New Topic
          </Link>
        </header>
        <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
