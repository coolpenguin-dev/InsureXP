import { AppShell } from "@/components/app-shell";

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell activeHref="/billing">{children}</AppShell>;
}
