import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Wrapper from "@/components/Wrapper";
import Head from "next/head";
import { AdminAuthProvider } from "@/context/AdminAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Conces Logo Rebranding",
  description: "Logo rebranding contest and voting platform",
  icons: {
    icon: "/images/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="" />
      </Head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AdminAuthProvider>
          <Wrapper>{children}</Wrapper>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
