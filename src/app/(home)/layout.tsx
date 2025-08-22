import type { Metadata } from "next";
import "../globals.css";
import Wrapper from "@/components/Wrapper";
import Head from "next/head";
import { AdminAuthProvider } from "@/context/AdminAuth";


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
        className={`antialiased`}
      >
        <AdminAuthProvider>
          <Wrapper>{children}</Wrapper>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
