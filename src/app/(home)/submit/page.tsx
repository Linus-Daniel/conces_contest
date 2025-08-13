"use client";
import SubmitProjectForm from "@/components/SubmitForm";
import { useEffect, useState } from "react";

export default function SubmitPage() {
  const [code, setCode] = useState<string | null>("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setCode(null);
    }
    2

  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <SubmitProjectForm />
        </div>
      </div>
    </div>
  );
}
