/** Dispatched from `apiFetch` on 401 so `AuthProvider` can clear session. */
export const SESSION_EXPIRED_EVENT = "insurexp:session-expired";

export function dispatchSessionExpired() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  }
}
