import Link from "next/link";

const nav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/billing", label: "Billing" },
  { href: "/payments", label: "Payments" },
  { href: "/patients", label: "Patients" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export function AppShell({
  children,
  activeHref = "/billing",
}: {
  children: React.ReactNode;
  activeHref?: string;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-100">
        <div className="p-4">
          <div className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-center text-xs font-bold tracking-[0.12em] text-slate-700">
            INSUREXP
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 px-3">
          {nav.map((item) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-indigo-600 font-medium text-white shadow-sm"
                    : "text-slate-600 hover:bg-white/80 hover:text-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200/80 p-4">
          <p className="text-sm font-semibold text-slate-900">Dr. Admin</p>
          <p className="text-xs text-slate-500">Super Admin</p>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto bg-white">{children}</main>
    </div>
  );
}
