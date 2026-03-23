"use client";

import { apiFetch, ApiError } from "@/lib/api";
import { FormEvent, useState } from "react";

export type PatientRecord = {
  id: string;
  name: string;
  insuranceId: string | null;
};

type CreatePatientResponse = {
  id: string;
  name: string;
  insuranceId: string | null;
};

export function PatientDetailsForm({
  onPatientSaved,
}: {
  onPatientSaved: (patient: PatientRecord) => void;
}) {
  const [name, setName] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Patient name is required.");
      return;
    }
    setLoading(true);
    try {
      const body: { name: string; insuranceId?: string } = { name: trimmed };
      const ins = insuranceId.trim();
      if (ins) body.insuranceId = ins;
      const created = await apiFetch<CreatePatientResponse>("/patients", {
        method: "POST",
        body: JSON.stringify(body),
      });
      onPatientSaved({
        id: created.id,
        name: created.name,
        insuranceId: created.insuranceId,
      });
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Could not save patient";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-indigo-100 bg-indigo-50/40 p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Patient details</h2>
      <p className="mt-1 text-sm text-slate-600">
        Enter the patient for this visit before adding services (Milestone 1).
      </p>
      <form className="mt-6 space-y-4" onSubmit={onSubmit}>
        <div>
          <label htmlFor="patient-name" className="text-sm font-medium text-slate-700">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="patient-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Sharma"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div>
          <label htmlFor="insurance-id" className="text-sm font-medium text-slate-700">
            Insurance / patient ID
          </label>
          <input
            id="insurance-id"
            value={insuranceId}
            onChange={(e) => setInsuranceId(e.target.value)}
            placeholder="e.g. INS-00421 (optional)"
            className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Continue to billing"}
        </button>
      </form>
    </div>
  );
}
