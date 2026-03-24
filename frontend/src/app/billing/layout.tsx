import { AppShell } from "@/components/app-shell";
import { RequireCashier } from "@/components/auth/require-cashier";

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireCashier>
      <AppShell activeHref="/billing">{children}</AppShell>
    </RequireCashier>
  );
}
