import AdminNav from "@/components/admin/AdminNav";
import { AdminGuard } from "@/components/auth/admin/AdminGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminNav />

      <main className="relative min-h-screen bg-zinc-50 text-zinc-900 transition-colors dark:bg-zinc-950 dark:text-zinc-100 pl-64">
        <div
          aria-hidden
          className="
            pointer-events-none
            absolute inset-0
            bg-gradient-to-tr from-violet-500/5 via-transparent to-purple-500/5
            opacity-70 dark:opacity-40
          "
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </AdminGuard>
  );
}