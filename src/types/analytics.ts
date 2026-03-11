export interface AnalyticsResult {
  period: string
  total_bookings: number
  total_revenue: number
  booked_nights: number
  available_room_nights: number
  occupancy_rate: string
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