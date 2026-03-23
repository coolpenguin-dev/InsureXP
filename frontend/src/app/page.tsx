import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 p-8">
      <div className="rounded-lg border border-slate-200 bg-slate-100 px-6 py-2.5 text-xs font-bold tracking-[0.12em] text-slate-700">
        INSUREXP
      </div>
      <p className="text-center text-sm text-slate-600">
        Healthcare billing — indigo &amp; lavender theme matching product reference.
      </p>
      <Link
        href="/billing"
        className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
      >
        Open billing workspace
      </Link>
    </div>
  );
}
