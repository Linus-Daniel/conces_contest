// app/admin/layout.tsx
import type { Metadata } from "next";
import "../../globals.css";
import AdminLayoutWrapper from "@/components/admin/Providers";
import { AdminAuthProvider } from "@/context/AdminAuth";
import { MaintenanceProvider } from "@/context/MaintenanceContext";
import Head from "next/head";

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
      <Head>
        {/* Google Tag Manager */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PRR6FNLR');`,
          }}
        />
      </Head>
      <body className="antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-PRR6FNLR"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */}

        <AdminAuthProvider>
          <MaintenanceProvider>
            <AdminLayoutWrapper>{children}</AdminLayoutWrapper>
          </MaintenanceProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
