import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Commit Crown - GitHub Commit Leaderboard",
  description:
    "The weekly GitHub commit leaderboard. Track the most active contributors, see live contribution heatmaps, and earn your crown.",
  openGraph: {
    title: "Commit Crown",
    description:
      "The weekly GitHub commit leaderboard. Ship code, earn your crown.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Commit Crown",
    description:
      "The weekly GitHub commit leaderboard. Ship code, earn your crown.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
