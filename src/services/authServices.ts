import { API_BASE_URL } from "@/config/api"
import { AuthLogin, AuthResponse } from "@/types/auth"

export async function loginAuthentication(data: AuthLogin): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })

  if (!res.ok) throw new Error("Invalid credentials")

  return res.json()
}

