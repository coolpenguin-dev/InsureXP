"use client";

import { useAuth } from "@/contexts/auth-context";
import { apiFetch, ApiError } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import {
  PatientDetailsForm,
  type PatientRecord,
} from "./patient-details-form";

type BillingTab = "billing" | "discount" | "cashback" | "split";

type ApiService = {
  id: string;
  name: string;
  category: string;
  price: string;
};

type Line = {
  localId: string;
  serviceId: string;
  serviceName: string;
  unit: number;
  qty: number;
};

function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

function parsePrice(p: string) {
  const n = Number.parseFloat(p);
  return Number.isFinite(n) ? n : 0;
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

function InfoCards({
  patient,
  hospitalLine,
  cashierLine,
}: {
  patient: PatientRecord;
  hospitalLine: string;
  cashierLine: string;
}) {
  const displayId =
    patient.insuranceId?.trim() || `PT-${patient.id.replace(/-/g, "").slice(0, 5).toUpperCase()}`;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-800/80">
            Patient
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {patient.name} <span className="text-slate-500">|</span> ID: {displayId}
          </p>
        </div>
        <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 px-4 py-3 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-800/80">
            Hospital
          </p>
          <p className="mt-1 text-sm font-medium text-slate-800">{hospitalLine}</p>
        </div>
      </div>
      <div className="rounded-xl border border-indigo-100 bg-indigo-50/90 px-4 py-3 shadow-sm">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-indigo-800/80">
          Cashier
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">{cashierLine}</p>
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

type BillCreated = {
  id: string;
  totalAmount: string;
};

export function BillingWorkspace() {
  const { cashier, hospital } = useAuth();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [tab, setTab] = useState<BillingTab>("billing");
  const [services, setServices] = useState<ApiService[]>([]);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [qty, setQty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [discountMode, setDiscountMode] = useState<"fixed" | "percent">("fixed");
  const [fixedDiscount, setFixedDiscount] = useState(500);
  const [percentDiscount, setPercentDiscount] = useState(10);
  const [discountApplyFeedback, setDiscountApplyFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [insuranceCashback, setInsuranceCashback] = useState(200);
  const [loyaltyReward, setLoyaltyReward] = useState(150);
  const [promoAmount, setPromoAmount] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [cashPercent, setCashPercent] = useState(10);

  useEffect(() => {
    if (!patient) return;
    let cancelled = false;
    setServicesError(null);
    (async () => {
      try {
        const list = await apiFetch<ApiService[]>("/services");
        if (!cancelled) {
          setServices(list);
          if (list.length && !list.some((s) => s.id === selectedServiceId)) {
            setSelectedServiceId(list[0].id);
          }
        }
      } catch (e) {
        if (!cancelled) {
          setServicesError(
            e instanceof ApiError ? e.message : "Could not load services",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [patient]); // eslint-disable-line react-hooks/exhaustive-deps -- refetch when patient changes

  const subtotal = useMemo(
    () => lines.reduce((s, l) => s + l.unit * l.qty, 0),
    [lines],
  );

  useEffect(() => {
    setDiscountApplyFeedback(null);
  }, [subtotal]);

  const proposedDiscount =
    discountMode === "fixed"
      ? fixedDiscount
      : Math.round((subtotal * percentDiscount) / 100);

  const discountApplied = proposedDiscount;

  const updatedAfterDiscount = Math.max(0, subtotal - discountApplied);

  function clearDiscountApplyFeedback() {
    setDiscountApplyFeedback(null);
  }

  function handleApplyDiscount() {
    if (proposedDiscount > subtotal) {
      setDiscountApplyFeedback({
        tone: "error",
        message: "Discount cannot exceed the subtotal. Lower the discount and try again.",
      });
      return;
    }
    setDiscountApplyFeedback({
      tone: "success",
      message: "Discount applied successfully.",
    });
  }
  const netPayable = Math.max(
    0,
    updatedAfterDiscount - insuranceCashback - loyaltyReward - promoAmount,
  );
  const savingsToday = subtotal - netPayable;

  const hospitalLine = hospital
    ? [hospital.name, hospital.location].filter(Boolean).join(" | ")
    : "—";

  const cashierLine = cashier
    ? `${cashier.name} | Shift: Morning`
    : "—";

  function addLine() {
    const svc = services.find((s) => s.id === selectedServiceId);
    if (!svc) return;
    const unit = parsePrice(svc.price);
    const localId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    setLines((prev) => [
      ...prev,
      {
        localId,
        serviceId: svc.id,
        serviceName: svc.name,
        unit,
        qty: Math.max(1, qty),
      },
    ]);
    setQty(1);
    setSaveMessage(null);
    setSaveError(null);
  }

  function removeLine(localId: string) {
    setLines((prev) => prev.filter((l) => l.localId !== localId));
    setSaveMessage(null);
  }

  function adjustLineQty(localId: string, delta: number) {
    setLines((prev) =>
      prev.map((l) => {
        if (l.localId !== localId) return l;
        const next = Math.max(1, l.qty + delta);
        return { ...l, qty: next };
      }),
    );
    setSaveMessage(null);
    setSaveError(null);
  }

  const servicesByCategory = useMemo(() => {
    const map = new Map<string, ApiService[]>();
    for (const s of services) {
      const cat = (s.category || "Other").trim() || "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(s);
    }
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [services]);

  async function saveBillToServer() {
    if (!patient || lines.length === 0) return;
    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);
    try {
      const bill = await apiFetch<BillCreated>("/bills/create", {
        method: "POST",
        body: JSON.stringify({
          patientId: patient.id,
          items: lines.map((l) => ({ serviceId: l.serviceId, qty: l.qty })),
        }),
      });
      const serverTotal = parsePrice(bill.totalAmount);
      if (Math.abs(serverTotal - subtotal) < 0.01) {
        setSaveMessage(
          `Bill saved. ID ${bill.id}. Total ${formatInr(serverTotal)} (matches subtotal).`,
        );
      } else {
        setSaveMessage(
          `Bill saved. ID ${bill.id}. Server total ${formatInr(serverTotal)}; UI subtotal ${formatInr(subtotal)}.`,
        );
      }
    } catch (e) {
      setSaveError(e instanceof ApiError ? e.message : "Failed to save bill");
    } finally {
      setSaving(false);
    }
  }

  const selectedSvc = services.find((s) => s.id === selectedServiceId);

  if (!patient) {
    return (
      <div className="p-6 sm:p-8">
        <h1 className="text-xl font-semibold text-slate-900">Billing</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter patient details to start a bill.
        </p>
        <div className="mt-8">
          <PatientDetailsForm onPatientSaved={setPatient} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Billing</h1>
        <button
          type="button"
          onClick={() => {
            setPatient(null);
            setLines([]);
            setServices([]);
            setSelectedServiceId("");
            setSaveMessage(null);
            setSaveError(null);
          }}
          className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          New patient
        </button>
      </div>

      <div className="mt-6">
        <InfoCards
          patient={patient}
          hospitalLine={hospitalLine}
          cashierLine={cashierLine}
        />
      </div>

      <div className="mt-8">
        <BillingTabs active={tab} onChange={setTab} />
      </div>

      <div className="mt-8 min-h-[320px]">
        {tab === "billing" && (
          <div className="space-y-6">
            {servicesError && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                {servicesError}
              </p>
            )}
            <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <span className="text-slate-500">Service Type:</span>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  disabled={!services.length}
                  className="max-w-full rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                >
                  {!services.length ? (
                    <option value="">No services</option>
                  ) : (
                    servicesByCategory.map(([category, list]) => (
                      <optgroup key={category} label={category}>
                        {list.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name} – {formatInr(parsePrice(s.price))}
                          </option>
                        ))}
                      </optgroup>
                    ))
                  )}
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
                  disabled={!services.length || !selectedServiceId}
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 disabled:opacity-40"
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
                  {lines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        No line items yet. Add a service above.
                      </td>
                    </tr>
                  ) : (
                    lines.map((row, i) => (
                      <tr
                        key={row.localId}
                        className={i % 2 === 0 ? "bg-white" : "bg-slate-50/80"}
                      >
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {row.serviceName}
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          {formatInr(row.unit)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              className="rounded border border-slate-300 bg-white px-2 py-0.5 text-sm text-slate-700 hover:bg-slate-50"
                              onClick={() => adjustLineQty(row.localId, -1)}
                              aria-label="Decrease quantity"
                            >
                              −
                            </button>
                            <span className="min-w-8 text-center font-medium text-slate-800">
                              {row.qty}
                            </span>
                            <button
                              type="button"
                              className="rounded border border-slate-300 bg-white px-2 py-0.5 text-sm text-slate-700 hover:bg-slate-50"
                              onClick={() => adjustLineQty(row.localId, 1)}
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">
                          {formatInr(row.unit * row.qty)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            type="button"
                            onClick={() => removeLine(row.localId)}
                            className="inline-flex rounded-lg p-1.5 text-sky-500 hover:bg-sky-50 hover:text-sky-600"
                            aria-label="Remove line"
                          >
                            <TrashIcon />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Subtotal
              </p>
              <p className="mt-1 text-sm text-slate-600">
                {lines.length} line item{lines.length === 1 ? "" : "s"} — sum of
                (unit price × quantity) for each row.
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-900">
                Subtotal:{" "}
                <span className="text-emerald-600">{formatInr(subtotal)}</span>
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => void saveBillToServer()}
                disabled={saving || lines.length === 0}
                className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save bill to server"}
              </button>
            </div>
            {saveMessage && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                {saveMessage}
              </p>
            )}
            {saveError && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {saveError}
              </p>
            )}
          </div>
        )}

        {tab === "discount" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/80 px-4 py-3 text-sm font-semibold text-indigo-900">
              Apply Discount %
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Fixed Discount (₹)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  value={fixedDiscount}
                  onChange={(e) => {
                    clearDiscountApplyFeedback();
                    const raw = e.target.value.trim();
                    if (raw === "") {
                      setFixedDiscount(0);
                      return;
                    }
                    const n = Number(raw);
                    if (!Number.isFinite(n)) {
                      return;
                    }
                    setFixedDiscount(Math.max(0, n));
                  }}
                  onBlur={() => {
                    setFixedDiscount((v) => (Number.isFinite(v) ? Math.max(0, v) : 0));
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "-" || e.key === "e" || e.key === "E" || e.key === "+") {
                      e.preventDefault();
                    }
                  }}
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
                  onChange={(e) => {
                    clearDiscountApplyFeedback();
                    setPercentDiscount(Number(e.target.value) || 0);
                  }}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
                <p className="mt-1 text-xs text-slate-500">Percentage of subtotal</p>
              </div>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => {
                  clearDiscountApplyFeedback();
                  setDiscountMode("fixed");
                }}
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
                onClick={() => {
                  clearDiscountApplyFeedback();
                  setDiscountMode("percent");
                }}
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
                <span
                  className={
                    proposedDiscount > subtotal ? "text-rose-600" : "text-emerald-600"
                  }
                >
                  {formatInr(updatedAfterDiscount)}
                </span>
              </div>
              {proposedDiscount > subtotal && (
                <p className="text-xs font-medium text-rose-600">
                  Discount is larger than the subtotal — apply will fail until you reduce it.
                </p>
              )}
            </div>
            {discountApplyFeedback && (
              <p
                role="status"
                aria-live="polite"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  discountApplyFeedback.tone === "success"
                    ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                    : "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
                }`}
              >
                {discountApplyFeedback.message}
              </p>
            )}
            <button
              type="button"
              onClick={handleApplyDiscount}
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
            <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/90 p-5 text-sm">
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
              Patient cash portion vs insurer (API integration pending).
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
                <span>
                  {formatInr(Math.round((netPayable * (100 - cashPercent)) / 100))}
                </span>
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
          Services loaded from <code className="rounded bg-slate-100 px-1">GET /api/services</code>
        </p>
      )}
    </div>
  );
}
