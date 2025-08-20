// app/admin/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminPage({children}: { children: React.ReactNode }) {
  // Server-side authentication check
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin-session");
  const adminCode = process.env.ADMIN_CODE;

  if (!adminSession || adminSession.value !== adminCode) {
    redirect("/admin/auth");
  }

  return (
    <div className="min-h-screen bg-gray-50">
     {children}
    </div>
  );
}
