// app/admin/layout.tsx
import { AdminGuard } from "@/components/auth/admin/AdminGuard";
import AdminNav from "@/components/admin/AdminNav";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminNav />

      <main className="relative min-h-screen bg-background pl-64">
        <div
          aria-hidden
          className="
            pointer-events-none
            absolute inset-0
            bg-ambient
            opacity-40
          "
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </AdminGuard>
  );
}