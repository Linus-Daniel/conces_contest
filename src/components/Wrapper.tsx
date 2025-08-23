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
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 4000,
            iconTheme: {
              primary: "#4BB543",
              secondary: "#fff",
            },
          },
          error: {
            duration: 5000,
          },
        }}
      />
      <CandidateProvider>
        <TimerProvider
         
        >
        
        <Header />
        <main className="flex-1 w-full ">{children}</main>
        <Footer />
        </TimerProvider>
      </CandidateProvider>
    </div>
  );
}

export default Wrapper;
