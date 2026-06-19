import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";

export const metadata = {
  title: "Админ-панель | Blue Sea",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  return (
    <div className="min-h-screen bg-cream-200">
      {authed ? (
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 ml-64 p-8">{children}</main>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
