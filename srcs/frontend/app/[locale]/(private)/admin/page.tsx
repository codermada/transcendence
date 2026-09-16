// app/admin/page.tsx
import { LayoutDashboard } from "@/components/icons";

export default function AdminDashboardPage() {
  return (
    <>
      <header className="mb-7 flex items-start gap-4">
        <div
          className="
            flex h-10 w-10 shrink-0
            items-center justify-center
            rounded-xl
            border border-brand-500/30
            bg-brand-500/10
            text-brand-400
            shadow-[0_0_20px_rgb(139_92_246_/_0.12)]
          "
        >
          <LayoutDashboard className="h-5 w-5" />
        </div>

        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-muted">
            Overview of your instance
          </p>
        </div>
      </header>

      {/* stat cards, recent activity, etc. */}
    </>
  );
}