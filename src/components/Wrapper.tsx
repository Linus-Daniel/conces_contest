import { CandidateProvider } from "@/context/authContext";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";
import { AdminAuthProvider } from "@/context/AdminAuth";
import { TimerProvider } from "@/context/CountdownContext";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#f9fafb", // light gray (almost white)
            color: "#111827", // slate-900 for text
            borderRadius: "0.75rem",
            padding: "12px 16px",
            fontSize: "14px",
            fontWeight: 500,
            border: "1px solid #e5e7eb", // light border for subtle separation
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
          },
          success: {
            duration: 4000,
            style: {
              background: "#ecfdf5", // light emerald tint
              color: "#065f46", // emerald-800 text
              border: "1px solid #a7f3d0", // soft green border
            },
            iconTheme: {
              primary: "#10b981", // emerald-500
              secondary: "#ecfdf5",
            },
          },
          error: {
            duration: 5000,
            style: {
              background: "#fef2f2", // soft red tint
              color: "#991b1b", // red-800 text
              border: "1px solid #fecaca", // light red border
            },
            iconTheme: {
              primary: "#ef4444", // red-500
              secondary: "#fef2f2",
            },
          },
        }}
      />

      <CandidateProvider>
        <TimerProvider>
          <Header />
          <main className="flex-1 w-full ">{children}</main>
          <Footer />
        </TimerProvider>
      </CandidateProvider>
    </div>
  );
}

export default Wrapper;
