import { CandidateProvider } from "@/context/authContext";
import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col">
      <Toaster />
      <CandidateProvider>
        <Header />
        <main className="flex-1 w-full sm:px-6 lg:px-8">{children}</main>
        <Footer />
      </CandidateProvider>
    </div>
  );
}

export default Wrapper;
