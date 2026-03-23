"use client";

import { useMemo, useState } from "react";

type BillingTab = "billing" | "discount" | "cashback" | "split";

const MOCK_SERVICES = [
  { id: "1", name: "Consultation", price: 1500 },
  { id: "2", name: "Lab – CBC Test", price: 850 },
  { id: "3", name: "Medication – Paracetamol", price: 120 },
] as const;

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function InfoCards() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-800/80">
            Patient
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            Rahul Sharma <span className="text-slate-500">|</span> ID: PT-00421
          </p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-800/80">
            Hospital
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            Apollo Multispecialty <span className="text-slate-500">|</span> Ward B
          </p>
        </div>
      </div>
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 px-4 py-3 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-800/80">
          Cashier
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">
          Priya Menon <span className="text-slate-500">|</span> Shift: Morning
        </p>
      </div>
    </div>
  );
}

function BillingTabs({
  active,
  onChange,
}: {
  active: BillingTab;
  onChange: (t: BillingTab) => void;
}) {
  const items: { id: BillingTab; label: string }[] = [
    { id: "billing", label: "Billing" },
    { id: "discount", label: "Discount" },
    { id: "cashback", label: "Cashback" },
    { id: "split", label: "Payment Split" },
  ];
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                : "border-indigo-200 bg-white text-indigo-700 hover:border-indigo-300 hover:bg-indigo-50/50"
            }`}
          >
            {item.id === "cashback" && isActive ? "Cashback ✓ ACTIVE" : item.label}
          </button>
        );
      })}
    </div>
  );
}

function FooterActions() {
  return (
    <div className="space-y-3 border-t border-slate-200 pt-6">
      <p className="text-center text-[11px] leading-relaxed text-slate-400">
        Connects to WhatsApp / email gateway and sends all the information as a
        bill
      </p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:flex-none sm:min-w-[160px]"
        >
          <span aria-hidden>🔍</span> Verify Bill
        </button>
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:flex-none sm:min-w-[160px]"
        >
          <span aria-hidden>⚡</span> Instant Settlement
        </button>
        <button
          type="button"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 sm:flex-none sm:min-w-[160px]"
        >
          <span aria-hidden>🚀</span> Expedited Settlement
        </button>
      </div>
    </div>
  );
}

type Line = { id: string; service: string; unit: number; qty: number };

export function BillingWorkspace() {
  const [tab, setTab] = useState<BillingTab>("billing");
  const [lines, setLines] = useState<Line[]>([
    { id: "a", service: "Consultation", unit: 1500, qty: 1 },
    { id: "b", service: "Lab – CBC Test", unit: 850, qty: 2 },
    { id: "c", service: "Medication – Paracetamol", unit: 120, qty: 5 },
  ]);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(MOCK_SERVICES[0].id);
  const [qty, setQty] = useState(1);

  const [discountMode, setDiscountMode] = useState<"fixed" | "percent">("fixed");
  const [fixedDiscount, setFixedDiscount] = useState(500);
  const [percentDiscount, setPercentDiscount] = useState(10);

  const [insuranceCashback, setInsuranceCashback] = useState(200);
  const [loyaltyReward, setLoyaltyReward] = useState(150);
  const [promoAmount, setPromoAmount] = useState(0);
  const [promoCode, setPromoCode] = useState("");

  const [cashPercent, setCashPercent] = useState(10);

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unit * l.qty, 0),
    [lines],
  );

  const discountApplied =
    discountMode === "fixed"
      ? Math.min(fixedDiscount, subtotal)
      : Math.round((subtotal * percentDiscount) / 100);

  const updatedAfterDiscount = Math.max(0, subtotal - discountApplied);
  const netPayable = Math.max(
    0,
    updatedAfterDiscount - insuranceCashback - loyaltyReward - promoAmount,
  );

  const savingsToday = subtotal - netPayable;

  function addLine() {
    const svc = MOCK_SERVICES.find((s) => s.id === selectedServiceId);
    if (!svc) return;
    const id = `${Date.now()}`;
    setLines((prev) => [
      ...prev,
      { id, service: svc.name, unit: svc.price, qty: Math.max(1, qty) },
    ]);
    setQty(1);
  }

  function removeLine(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  const selectedSvc = MOCK_SERVICES.find((s) => s.id === selectedServiceId);

  return (
    <div className="p-6 sm:p-8">
      <InfoCards />

      <div className="mt-8">
        <BillingTabs active={tab} onChange={setTab} />
      </div>

      <div className="mt-8 min-h-[320px]">
        {tab === "billing" && (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <span className="text-slate-500">Service Type:</span>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="max-w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                >
                  {MOCK_SERVICES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} – {formatInr(s.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-500">Qty:</span>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50"
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span className="min-w-6 text-center font-semibold">{qty}</span>
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-slate-700 hover:bg-slate-50"
                    onClick={() => setQty((q) => q + 1)}
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={addLine}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  + Add Item
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    <th className="px-4 py-3">Service</th>
                    <th className="px-4 py-3">Unit Price</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((row, i) => (
                    <tr
                      key={row.id}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
                    >
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {row.service}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {formatInr(row.unit)}
                      </td>
                      <td className="px-4 py-3 text-slate-700">{row.qty}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {formatInr(row.unit * row.qty)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeLine(row.id)}
                          className="inline-flex rounded-lg p-1.5 text-sky-500 hover:bg-sky-50 hover:text-sky-600"
                          aria-label="Remove line"
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-base font-semibold text-slate-800">
              Subtotal:{" "}
              <span className="text-emerald-600">{formatInr(subtotal)}</span>
            </p>
          </div>
        )}

        {tab === "discount" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm font-semibold text-indigo-900">
              ☑ Apply Discount %
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Fixed Discount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  value={fixedDiscount}
                  onChange={(e) => setFixedDiscount(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="mt-1 text-xs text-slate-500">Flat amount off total</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Percentage Discount (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={percentDiscount}
                  onChange={(e) => setPercentDiscount(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="mt-1 text-xs text-slate-500">Percentage of subtotal</p>
              </div>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => setDiscountMode("fixed")}
                className={`rounded-lg px-3 py-1.5 font-medium ${
                  discountMode === "fixed"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Fixed
              </button>
              <span className="self-center text-slate-400">|</span>
              <button
                type="button"
                onClick={() => setDiscountMode("percent")}
                className={`rounded-lg px-3 py-1.5 font-medium ${
                  discountMode === "percent"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Percentage
              </button>
            </div>
            <div className="space-y-2 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{formatInr(subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Discount Applied</span>
                <span>− {formatInr(discountApplied)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2" />
              <div className="flex justify-between text-base font-semibold">
                <span className="text-slate-800">Updated Total</span>
                <span className="text-emerald-600">{formatInr(updatedAfterDiscount)}</span>
              </div>
            </div>
            <button
              type="button"
              className="w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 sm:w-auto sm:px-10"
            >
              ✅ Apply Discount
            </button>
          </div>
        )}

        {tab === "cashback" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">💰 Cashback &amp; Rewards</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <p className="text-xs font-semibold uppercase text-indigo-800">
                  Insurance Cashback
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Amount:{" "}
                  <input
                    type="number"
                    min={0}
                    value={insuranceCashback}
                    onChange={(e) => setInsuranceCashback(Number(e.target.value) || 0)}
                    className="ml-1 w-24 rounded border border-slate-200 px-2 py-1 text-sm font-semibold"
                  />
                </p>
                <p className="mt-1 text-xs text-slate-500">Source: HDFC Health Shield</p>
              </div>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <p className="text-xs font-semibold uppercase text-indigo-800">
                  Loyalty Rewards
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Amount:{" "}
                  <input
                    type="number"
                    min={0}
                    value={loyaltyReward}
                    onChange={(e) => setLoyaltyReward(Number(e.target.value) || 0)}
                    className="ml-1 w-24 rounded border border-slate-200 px-2 py-1 text-sm font-semibold"
                  />
                </p>
                <p className="mt-1 text-xs text-slate-500">Source: InsureXP Points</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                type="button"
                onClick={() => {
                  if (promoCode.trim()) setPromoAmount(50);
                }}
                className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Apply
              </button>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 p-5 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Updated Total (after discount)</span>
                <span>{formatInr(updatedAfterDiscount)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Insurance Cashback</span>
                <span>− {formatInr(insuranceCashback)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Loyalty Rewards</span>
                <span>− {formatInr(loyaltyReward)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Promo Code</span>
                <span>− {formatInr(promoAmount)}</span>
              </div>
              <div className="border-t border-indigo-200 pt-3" />
              <div className="flex justify-between text-base font-bold">
                <span className="text-slate-800">NET PAYABLE</span>
                <span className="text-emerald-600">{formatInr(netPayable)}</span>
              </div>
            </div>
            <p className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              YOU SAVED {formatInr(savingsToday)} TODAY! 🎉
            </p>
          </div>
        )}

        {tab === "split" && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-slate-900">Payment Split</h2>
            <p className="text-sm text-slate-600">
              Patient cash portion vs insurer (illustrative — wire to API later).
            </p>
            <div>
              <label className="text-sm font-medium text-slate-700">
                Cash paid by patient (%)
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={cashPercent}
                onChange={(e) => setCashPercent(Number(e.target.value))}
                className="mt-2 w-full accent-indigo-600"
              />
              <div className="mt-2 flex justify-between text-sm text-slate-600">
                <span>Cash: {cashPercent}%</span>
                <span>Insurance: {100 - cashPercent}%</span>
              </div>
            </div>
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 p-4 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-600">Net payable (reference)</span>
                <span className="font-semibold text-slate-800">
                  {formatInr(netPayable)}
                </span>
              </div>
              <div className="mt-2 flex justify-between text-slate-600">
                <span>Patient pays</span>
                <span>{formatInr(Math.round((netPayable * cashPercent) / 100))}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Insurer pays</span>
                <span>{formatInr(Math.round((netPayable * (100 - cashPercent)) / 100))}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-10">
        <FooterActions />
      </div>

      {tab === "billing" && selectedSvc && (
        <p className="mt-6 text-center text-[11px] text-slate-400">
          Demo line items — API: services from{" "}
          <code className="rounded bg-slate-100 px-1">/api/services</code>
        </p>
      )}
    </div>
  );
}
