// src/app/page.tsx
"use client";

import { useState } from "react";
import Header from "@/components/admin/Header";
import Sidebar from "@/components/admin/SideBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">

        <Header onSidebarToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:ml-64">
          {children}
        </main>
      </div>
    </div>
  );
}
