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
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="rounded-xl border-2 border-indigo-200 bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-sm hover:bg-indigo-50"
        >
          Cashier sign in
        </Link>
        <Link
          href="/billing"
          className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
        >
          Billing (requires sign in)
        </Link>
      </div>
    </div>
  );
}
