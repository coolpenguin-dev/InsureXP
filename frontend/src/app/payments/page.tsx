import { AppShell } from "@/components/app-shell";

export default function PaymentsPage() {
  return (
    <AppShell activeHref="/payments">
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="mt-2 text-sm text-zinc-600">Placeholder.</p>
      </div>
    </AppShell>
  );
}
