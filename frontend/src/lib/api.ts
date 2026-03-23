import { apiBaseUrl } from "./config";
import { getAccessToken } from "./auth-storage";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type FetchOptions = RequestInit & { auth?: boolean };

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const { auth = true, headers: initHeaders, ...rest } = options;
  const headers = new Headers(initHeaders);
  if (!headers.has("Content-Type") && rest.body && !(rest.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (auth) {
    const token = getAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }
  const url = path.startsWith("http") ? path : `${apiBaseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  let res: Response;
  try {
    res = await fetch(url, { ...rest, headers });
  } catch (e) {
    const isTypeError = e instanceof TypeError;
    const base = isTypeError ? e.message : e instanceof Error ? e.message : "Network error";
    const hint = ` (${url}). Start the API from the repo root: npm run dev (Nest listens on port 4000).`;
    throw new ApiError(base + hint, 0, e);
  }
  const text = await res.text();
  let data: unknown = undefined;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    let msg = res.statusText;
    if (typeof data === "object" && data !== null && "message" in data) {
      const m = (data as { message: unknown }).message;
      if (Array.isArray(m)) msg = m.map(String).join(", ");
      else if (typeof m === "string") msg = m;
    }
    throw new ApiError(msg || "Request failed", res.status, data);
  }
  return data as T;
}
