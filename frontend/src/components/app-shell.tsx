"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const { cashier, logout } = useAuth();
  const router = useRouter();

  return (
    <div className="flex h-screen min-h-0 overflow-hidden bg-slate-50 text-slate-900">
      <aside className="flex h-full w-[220px] shrink-0 flex-col border-r border-slate-200/80 bg-slate-100">
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
          {cashier ? (
            <>
              <p className="text-sm font-semibold text-slate-900">{cashier.name}</p>
              <p className="text-xs text-slate-500">Cashier</p>
              <button
                type="button"
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="mt-3 text-xs font-medium text-indigo-600 hover:underline"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-slate-900">Guest</p>
              <Link
                href="/login"
                className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </aside>
      <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-white">{children}</main>
    </div>
  );
}
