// app/admin/layout.tsx (Updated)
import type { Metadata } from "next";
import "../../globals.css";
import AdminLayoutWrapper from "@/components/admin/Providers";
import { AdminAuthProvider } from "@/context/AdminAuth";

export const metadata: Metadata = {
  title: "Conces Contest Admin",
  description: "Contest management dashboard",
  icons: {
    icon: "/logo.png",
  },
};

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdminAuthProvider>
          <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
