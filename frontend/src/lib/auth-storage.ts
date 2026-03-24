const STORAGE_KEY = "insurexp.session";

export type StoredCashier = {
  id: string;
  name: string;
  email: string;
  hospitalId: string;
};

export type StoredHospital = {
  id: string;
  name: string;
  location: string | null;
};

export type StoredSession = {
  accessToken: string;
  cashier: StoredCashier;
  hospital: StoredHospital | null;
};

export function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredSession;
    if (!data?.accessToken || !data?.cashier?.id) return null;
    return data;
  } catch {
    return null;
  }
}

export function writeSession(session: StoredSession) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getAccessToken(): string | null {
  return readSession()?.accessToken ?? null;
}
