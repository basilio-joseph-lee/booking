import { API_BASE_URL } from "@/config/api";
import { AuthLogin, AuthResponse } from "@/types/auth";

export async function loginAuthentication(data: AuthLogin): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Invalid credentials");

  const json: AuthResponse = await res.json();

  // Save logged-in user to localStorage for use across the app
  if (json.user) {
    localStorage.setItem("auth_user", JSON.stringify(json.user));
  }

  return json;
}

export function getAuthUser() {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("auth_user");
  return raw ? JSON.parse(raw) : null;
}

export function getAuthUserId(): number | null {
  return getAuthUser()?.id ?? null;
}

export function logout() {
  localStorage.removeItem("auth_user");
}