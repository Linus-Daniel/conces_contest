// components/admin/AdminLayoutWrapper.tsx
"use client"

import { AdminAuthProvider, useAdminAuth } from "@/context/AdminAuth";
import { usePathname } from "next/navigation";
import Layout from "./Layout";

interface AdminLayoutWrapperProps {
  children: React.ReactNode;
}
export default function AdminLayoutWrapper({
  children,
}: AdminLayoutWrapperProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const pathname = usePathname();

  // Routes that don't need the admin layout
  const publicRoutes = ["/auth/admin"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  // For public routes (like login), render without layout
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // For protected routes, only render with layout if authenticated
  if (isAuthenticated) {
    return <Layout>{children}</Layout>;
  }

  // If not authenticated, show loading (user will be redirected)
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}
