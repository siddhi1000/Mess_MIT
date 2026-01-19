const API_BASE = "http://localhost:4000/api";

export type Role = "SUPER_ADMIN" | "ADMIN" | "STUDENT";

export type User = {
  id: number;
  username: string;
  role: Role;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const authToken = token || localStorage.getItem("token");
  if (authToken) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Request failed");
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}
