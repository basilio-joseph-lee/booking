import { API_BASE_URL } from "@/config/api"

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface AnalyticsResult {
  period: string
  total_bookings: number
  unique_guests: number
  total_revenue: number
  avg_revenue_per_booking: number
  revpar: number
  booked_nights: number
  available_room_nights: number
  avg_length_of_stay: number
  occupancy_rate: string
  status_breakdown: {
    confirmed: number
    pending: number
    cancelled: number
  }
  cancellation_rate: string
  total_transactions: number
  total_appointments: number
}

export interface MonthlyAnalytics {
  total_rooms: number
  filters: {
    year: number | null
    status: string | null
  }
  results: AnalyticsResult[]
}

export interface AnalyticsFilters {
  year?: number
  status?: string
}

// ─── SERVICE ─────────────────────────────────────────────────────────────────

export async function getMonthlyAnalytics(filters?: AnalyticsFilters): Promise<MonthlyAnalytics> {
  const params = new URLSearchParams()
  if (filters?.year)   params.set("year",   String(filters.year))
  if (filters?.status) params.set("status", filters.status)

  const query = params.toString() ? `?${params.toString()}` : ""
  const url   = `${API_BASE_URL}bookings/analytics/monthly${query}`
  console.log("[Analytics] Fetching:", url)

  const res = await fetch(url, { cache: "no-store" })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Analytics ${res.status}: ${text || res.statusText}`)
  }
  return res.json()
}