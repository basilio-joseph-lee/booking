"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { getMonthlyAnalytics, MonthlyAnalytics, AnalyticsResult } from "@/services/analyticsService";
import { getBookings } from "@/services/bookingService";
import { getGuests } from "@/services/guestService";
import { Booking } from "@/types/bookings";
import { Guest } from "@/types/guests";
import { useToast } from "@/hooks/useToast";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const BOOKING_STATUSES = ["Pending", "Confirmed", "Cancelled", "Completed"];
const CURRENT_YEAR    = new Date().getFullYear();
const YEAR_OPTIONS    = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

const MONTH_LABELS: Record<string, string> = {
  "01": "Jan", "02": "Feb", "03": "Mar", "04": "Apr",
  "05": "May", "06": "Jun", "07": "Jul", "08": "Aug",
  "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dec",
};

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  Pending:   { bg: "#fefce8", color: "#a16207", dot: "#eab308" },
  Confirmed: { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  Cancelled: { bg: "#fff1f2", color: "#be123c", dot: "#f43f5e" },
  Completed: { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function fmtPeriod(period: string) {
  const [, m] = period.split("-");
  return MONTH_LABELS[m] ?? period;
}

function fmtMoney(n: number) {
  if (n >= 1_000_000) return `₱${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `₱${(n / 1_000).toFixed(1)}K`;
  return `₱${n.toLocaleString()}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── STAT CARD ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent, icon }: {
  label: string; value: string; sub?: string; accent: string; icon: React.ReactNode;
}) {
  return (
    <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: accent + "18", display: "flex", alignItems: "center", justifyContent: "center", color: accent }}>
          {icon}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#0f172a", borderRadius: 12, padding: "12px 16px", boxShadow: "0 8px 24px rgba(0,0,0,0.25)", fontFamily: "'DM Sans', sans-serif", minWidth: 190 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#94a3b8", marginBottom: 8, letterSpacing: "0.06em" }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 13, marginBottom: 4 }}>
          <span style={{ color: p.color, fontWeight: 600 }}>{p.name}</span>
          <span style={{ fontWeight: 700, color: "#fff" }}>
            {p.name === "Revenue"       ? fmtMoney(p.value)    :
             p.name === "RevPAR"        ? fmtMoney(p.value)    :
             p.name === "Occupancy %"   ? `${p.value}%`        :
             p.name === "Cancel Rate"   ? `${p.value}%`        :
             p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}

// ─── MINI METRIC ROW ─────────────────────────────────────────────────────────

function MetricRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f8fafc" }}>
      <span style={{ fontSize: 13, color: "#64748b" }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: color ?? "#0f172a" }}>{value}</span>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [analytics, setAnalytics]       = useState<MonthlyAnalytics | null>(null);
  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [guests, setGuests]             = useState<Guest[]>([]);
  const [loading, setLoading]           = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [yearFilter, setYearFilter]     = useState<number>(CURRENT_YEAR);
  const [statusFilter, setStatusFilter] = useState<string>("");

  const toast = useToast();

  function guestName(id: number) {
    return guests.find((g) => g.guest_id === id)?.full_name ?? `Guest #${id}`;
  }

  const loadAnalytics = useCallback(async () => {
    setChartLoading(true);
    try {
      const data = await getMonthlyAnalytics({ year: yearFilter, status: statusFilter || undefined });
      setAnalytics(data);
    } catch (e: any) { toast.error(e.message); }
    finally { setChartLoading(false); }
  }, [yearFilter, statusFilter]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      setError(null);
      try {
        const [a, b, g] = await Promise.all([
          getMonthlyAnalytics({ year: yearFilter }),
          getBookings(),
          getGuests(),
        ]);
        setAnalytics(a);
        setBookings(b);
        setGuests(g);
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    }
    init();
  }, []);

  useEffect(() => { if (!loading) loadAnalytics(); }, [yearFilter, statusFilter]);

  // ── Derived ──
  const results: AnalyticsResult[] = analytics?.results ?? [];

  const totals = results.reduce(
    (acc, r) => ({
      bookings:      acc.bookings      + r.total_bookings,
      revenue:       acc.revenue       + r.total_revenue,
      nights:        acc.nights        + r.booked_nights,
      guests:        acc.guests        + r.unique_guests,
      transactions:  acc.transactions  + r.total_transactions,
      appointments:  acc.appointments  + r.total_appointments,
      occ:           acc.occ           + parseFloat(r.occupancy_rate),
      cancelRate:    acc.cancelRate    + parseFloat(r.cancellation_rate),
    }),
    { bookings: 0, revenue: 0, nights: 0, guests: 0, transactions: 0, appointments: 0, occ: 0, cancelRate: 0 }
  );

  const avgOcc        = results.length ? (totals.occ        / results.length).toFixed(1) : "0.0";
  const avgCancelRate = results.length ? (totals.cancelRate / results.length).toFixed(1) : "0.0";

  // Aggregate status breakdown across all months
  const statusBreakdown = results.reduce(
    (acc, r) => ({
      confirmed: acc.confirmed + (r.status_breakdown?.confirmed ?? 0),
      pending:   acc.pending   + (r.status_breakdown?.pending   ?? 0),
      cancelled: acc.cancelled + (r.status_breakdown?.cancelled ?? 0),
    }),
    { confirmed: 0, pending: 0, cancelled: 0 }
  );

  const chartData = results.map((r) => ({
    month:           fmtPeriod(r.period),
    Bookings:        r.total_bookings,
    Revenue:         r.total_revenue,
    "Booked Nights": r.booked_nights,
    "Occupancy %":   parseFloat(r.occupancy_rate),
    RevPAR:          r.revpar,
    "Cancel Rate":   parseFloat(r.cancellation_rate),
  }));

  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 8);

  // status counts from bookings list
  const statusCounts = BOOKING_STATUSES.reduce((acc, s) => {
    acc[s] = bookings.filter((b) => b.status === s).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <>
      <style>{`
        @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .ds { animation: fadeUp 0.35s ease both; }
        table { border-collapse: collapse; width: 100%; }
        tbody tr:hover td { background: #f8fafc; }
      `}</style>

      <div style={{ padding: "36px 40px", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

        {/* ── Error ── */}
        {error && (
          <div style={{ background: "#fff1f2", color: "#be123c", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, fontWeight: 500 }}>
            ⚠ {error}
          </div>
        )}

        {/* ── Header ── */}
        <div className="ds" style={{ animationDelay: "0ms", display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Dashboard</h1>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
              Welcome back, Admin ·{" "}
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {chartLoading && (
              <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#3b82f6", animation: "pulse 1s infinite" }} />
                Updating…
              </div>
            )}
            <select value={yearFilter} onChange={(e) => setYearFilter(Number(e.target.value))}
              style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer", fontWeight: 600 }}>
              {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer", fontWeight: 600 }}>
              <option value="">All Statuses</option>
              {BOOKING_STATUSES.map((s) => <option key={s} value={s.toLowerCase()}>{s}</option>)}
            </select>
          </div>
        </div>

        {/* ── Top Stat Cards ── */}
        <div className="ds" style={{ animationDelay: "50ms", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 16 }}>
          <StatCard label="Total Bookings"  value={loading ? "—" : String(totals.bookings)}        sub={`${results.length} month${results.length !== 1 ? "s" : ""} of data`} accent="#3b82f6"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>} />
          <StatCard label="Total Revenue"   value={loading ? "—" : fmtMoney(totals.revenue)}        sub={`avg ${fmtMoney(results.length ? totals.revenue / results.length : 0)}/mo`} accent="#22c55e"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>} />
          <StatCard label="Unique Guests"   value={loading ? "—" : String(totals.guests)}           sub={`${totals.bookings} total bookings`} accent="#f59e0b"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>} />
          <StatCard label="Avg Occupancy"   value={loading ? "—" : `${avgOcc}%`}                    sub={`${analytics?.total_rooms ?? 0} total rooms`} accent="#8b5cf6"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>} />
        </div>

        {/* ── Secondary Stat Cards ── */}
        <div className="ds" style={{ animationDelay: "80ms", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 24 }}>
          <StatCard label="Booked Nights"    value={loading ? "—" : totals.nights.toLocaleString()}   sub="total nights booked" accent="#06b6d4"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>} />
          <StatCard label="Transactions"     value={loading ? "—" : String(totals.transactions)}      sub="total transactions" accent="#10b981"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>} />
          <StatCard label="Appointments"     value={loading ? "—" : String(totals.appointments)}      sub="total appointments" accent="#f43f5e"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h.01M12 14h.01M16 14h.01"/></svg>} />
          <StatCard label="Avg Cancel Rate"  value={loading ? "—" : `${avgCancelRate}%`}              sub="monthly average" accent="#ef4444"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>} />
        </div>

        {/* ── Chart + Breakdown ── */}
        <div className="ds" style={{ animationDelay: "110ms", display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, marginBottom: 24 }}>

          {/* Chart */}
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: "24px 28px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>Monthly Analytics</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>
              {yearFilter} · {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "All statuses"}
            </div>

            {loading ? (
              <div style={{ height: 300, background: "#f8fafc", borderRadius: 12, animation: "pulse 1.5s ease-in-out infinite" }} />
            ) : chartData.length === 0 ? (
              <div style={{ height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 14 }}>No data for selected filters.</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }} axisLine={false} tickLine={false} width={36} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8", fontFamily: "'DM Sans', sans-serif" }} axisLine={false} tickLine={false} width={52} tickFormatter={(v) => fmtMoney(v)} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: "'DM Sans', sans-serif", paddingTop: 12 }} iconType="circle" iconSize={8} />
                  <Bar     yAxisId="left"  dataKey="Bookings"      fill="#3b82f6" radius={[5,5,0,0]} maxBarSize={36} opacity={0.9} />
                  <Bar     yAxisId="left"  dataKey="Booked Nights" fill="#f59e0b" radius={[5,5,0,0]} maxBarSize={36} opacity={0.9} />
                  <Line   yAxisId="right" type="monotone" dataKey="Revenue"      stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line   yAxisId="left"  type="monotone" dataKey="Occupancy %"  stroke="#8b5cf6" strokeWidth={2.5} strokeDasharray="5 3" dot={{ r: 4, fill: "#8b5cf6", strokeWidth: 0 }} activeDot={{ r: 6 }} />
                  <Line   yAxisId="right" type="monotone" dataKey="RevPAR"       stroke="#06b6d4" strokeWidth={2} dot={{ r: 3, fill: "#06b6d4", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Side breakdown panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Status breakdown */}
            <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>Status Breakdown</div>
              {BOOKING_STATUSES.map((s) => {
                const style = STATUS_STYLE[s];
                const count = statusCounts[s] ?? 0;
                const pct   = bookings.length ? Math.round((count / bookings.length) * 100) : 0;
                return (
                  <div key={s} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <StatusBadge status={s} />
                      <span style={{ fontSize: 13, fontWeight: 800, color: style.color }}>{count}</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 99, background: "#f1f5f9", overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${pct}%`, background: style.dot, borderRadius: 99, transition: "width 0.6s ease" }} />
                    </div>
                    <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 3 }}>{pct}% of total</div>
                  </div>
                );
              })}
            </div>

            {/* Analytics summary */}
            <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 20, padding: "20px 22px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 14 }}>Period Summary</div>
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: 12, borderRadius: 5, background: "#1e293b", marginBottom: 10, animation: "pulse 1.4s ease-in-out infinite" }} />
                ))
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e293b" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Avg Stay</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{results.length ? (results.reduce((s, r) => s + r.avg_length_of_stay, 0) / results.length).toFixed(1) : "—"} nights</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e293b" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Avg Rev/Booking</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{results.length ? fmtMoney(results.reduce((s, r) => s + r.avg_revenue_per_booking, 0) / results.length) : "—"}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e293b" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Confirmed</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#22c55e" }}>{statusBreakdown.confirmed}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #1e293b" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Pending</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#eab308" }}>{statusBreakdown.pending}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 0" }}>
                    <span style={{ fontSize: 12, color: "#64748b" }}>Cancelled</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#f43f5e" }}>{statusBreakdown.cancelled}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Recent Bookings ── */}
        <div className="ds" style={{ animationDelay: "150ms", background: "#fff", border: "1px solid #f1f5f9", borderRadius: 20, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Recent Bookings</div>
            <div style={{ fontSize: 12, color: "#94a3b8" }}>Latest 8</div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr style={{ background: "#f8fafc" }}>
                  {["ID", "Guest", "Check-in", "Check-out", "Amount", "Status", "Created"].map((h) => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[40, 120, 90, 90, 70, 80, 90].map((w, j) => (
                          <td key={j} style={{ padding: "13px 16px" }}>
                            <div style={{ height: 11, width: w, borderRadius: 5, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${j * 0.05}s` }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : recentBookings.map((b) => (
                      <tr key={b.booking_id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>#{b.booking_id}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{guestName(b.guest)}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{formatDate(b.check_in_date)}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{formatDate(b.check_out_date)}</td>
                        <td style={{ padding: "13px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>₱{parseFloat(b.total_amount).toLocaleString()}</td>
                        <td style={{ padding: "13px 16px" }}><StatusBadge status={b.status} /></td>
                        <td style={{ padding: "13px 16px", fontSize: 12, color: "#94a3b8", whiteSpace: "nowrap" }}>{formatDate(b.created_at)}</td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
          {!loading && recentBookings.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "32px 0", fontSize: 14 }}>No bookings yet.</div>
          )}
        </div>
      </div>
    </>
  );
}