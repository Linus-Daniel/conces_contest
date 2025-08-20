
// app/admin/login/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminLoginForm from "@/components/admin/LoginForm";

export default async function AdminLoginPage() {
  // Check if already authenticated
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin-session");
  const adminCode = process.env.ADMIN_CODE;

  if (adminSession && adminSession.value === adminCode) {
    redirect("/admin");
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Access
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter the 6-digit admin code to continue
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </div>
  );
}
