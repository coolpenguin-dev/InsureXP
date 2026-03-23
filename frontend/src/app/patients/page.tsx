import { AppShell } from "@/components/app-shell";

export default function PatientsPage() {
  return (
    <AppShell activeHref="/patients">
      <div className="p-8">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <p className="mt-2 text-sm text-zinc-600">Placeholder.</p>
      </div>
    </AppShell>
  );
}
