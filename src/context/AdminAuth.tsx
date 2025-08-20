// contexts/AdminAuthContext.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";

interface AdminUser {
  role: "admin";
  authenticated: boolean;
  email?: string;
  name?: string;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (code: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

// Public routes that don't require authentication
const PUBLIC_ADMIN_ROUTES = ["/admin/login"];

interface AdminAuthProviderProps {
  children: ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicRoute = PUBLIC_ADMIN_ROUTES.includes(pathname);
  const isAuthenticated = !!user?.authenticated;

  // Check authentication status
  const checkAuth = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/admin/verify", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
        // Only redirect if not already on a public route
        if (!isPublicRoute && pathname.startsWith("/admin")) {
          router.push("/auth/admin");
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      if (!isPublicRoute && pathname.startsWith("/admin")) {
        router.push("/auth/admin");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Login function
  const login = async (
    code: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/auth/admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        // Set user after successful login
        setUser({
          role: "admin",
          authenticated: true,
          email: "admin@contestpro.com",
          name: "Admin User",
        });

        // Redirect to admin dashboard
        router.push("/admin");
        router.refresh();

        return { success: true, message: "Login successful" };
      } else {
        return { success: false, message: data.message || "Invalid code" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Something went wrong. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);

      await fetch("/api/auth/admin/logout", {
        method: "POST",
        credentials: "include",
      });

      // Clear user state
      setUser(null);

      // Redirect to login
      router.push("/auth/admin");
      router.refresh();
    } catch (error) {
      console.error("Logout error:", error);
      // Even if the API call fails, clear local state and redirect
      setUser(null);
      router.push("/auth/admin");
    } finally {
      setIsLoading(false);
    }
  };

  // Check auth on mount and route changes
  useEffect(() => {
    checkAuth();
  }, [pathname]);

  // Auto-refresh auth status every 5 minutes
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(checkAuth, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const value: AdminAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

// Custom hook to use admin auth context
export function useAdminAuth(): AdminAuthContextType {
  const context = useContext(AdminAuthContext);

  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }

  return context;
}

// HOC for protecting admin routes
export function withAdminAuth<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAdminAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      if (
        !isLoading &&
        !isAuthenticated &&
        !PUBLIC_ADMIN_ROUTES.includes(pathname)
      ) {
        router.push("/admin/login");
      }
    }, [isAuthenticated, isLoading, pathname, router]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated && !PUBLIC_ADMIN_ROUTES.includes(pathname)) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Redirecting...</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}
