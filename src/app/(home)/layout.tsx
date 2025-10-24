// app/layout.tsx
import type { Metadata } from "next";
import "../globals.css";
import Wrapper from "@/components/Wrapper";
import { AdminAuthProvider } from "@/context/AdminAuth";
import { MaintenanceProvider } from "@/context/MaintenanceContext";
import Head from "next/head";

export const metadata: Metadata = {
  title: "Conces Logo Rebranding",
  description: "Logo rebranding contest and voting platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Head>
        <link rel="icon" href="/favicon.ico" sizes="any" />

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
            <Wrapper>{children}</Wrapper>
          </MaintenanceProvider>
        </AdminAuthProvider>
      </body>
    </html>
  );
}
