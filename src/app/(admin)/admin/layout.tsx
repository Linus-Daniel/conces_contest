import type { Metadata } from "next";
import "../../globals.css";
import Layout from "@/components/admin/Layout";

export const metadata: Metadata = {
  title: "Conces Contest Admin",
  description: "Contest managment dashboard",
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
      <body className={` antialiased`}>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
