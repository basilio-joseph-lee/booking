"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";
import { API_BASE_URL } from "@/config/api";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface KPI {
  total_revenue:      number;
  total_transactions: number;
  avg_transaction:    number;
}

interface CategoryRow {
  category: string;
  revenue:  number;
  count:    number;
  pct:      number;
}

interface MonthlyRow {
  month:      number;
  month_name: string;
  revenue:    number;
  count:      number;
}

interface TopRoom {
  room_id:     number;
  room_number: string;
  type:        string;
  revenue:     number;
  bookings:    number;
}

interface TopService {
  category: string;
  revenue:  number;
  count:    number;
}

interface SalesSummary {
  filters:      { year: number; month: number | null };
  kpi:          KPI;
  by_category:  CategoryRow[];
  monthly:      MonthlyRow[];
  top_rooms:    TopRoom[];
  top_services: TopService[];
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const MONTHS = [
  { value: "", label: "Full Year" },
  { value: "1",  label: "January"   }, { value: "2",  label: "February"  },
  { value: "3",  label: "March"     }, { value: "4",  label: "April"     },
  { value: "5",  label: "May"       }, { value: "6",  label: "June"      },
  { value: "7",  label: "July"      }, { value: "8",  label: "August"    },
  { value: "9",  label: "September" }, { value: "10", label: "October"   },
  { value: "11", label: "November"  }, { value: "12", label: "December"  },
];

const CATEGORY_COLORS: Record<string, string> = {
  "Room Bookings": "#3b82f6",
  "Spa & Wellness": "#a855f7",
  "Dining":        "#f59e0b",
  "Others":        "#64748b",
};

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => CURRENT_YEAR - i);

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function peso(n: number) {
  return "₱" + n.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function Skeleton({ h = 20, w = "100%" }: { h?: number; w?: string }) {
  return (
    <div style={{ height: h, width: w, borderRadius: 8, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite" }} />
  );
}

// ─── CUSTOM TOOLTIP ──────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 16px rgba(0,0,0,0.1)", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#64748b", marginBottom: 6 }}>{label}</div>
      {payload.map((p: any, i: number) => (
        <div key={i} style={{ fontSize: 13, fontWeight: 700, color: p.color }}>
          {p.name}: {p.name === "Revenue" ? peso(p.value) : p.value}
        </div>
      ))}
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function SalesPage() {
  const [year,    setYear]    = useState(String(CURRENT_YEAR));
  const [month,   setMonth]   = useState("");
  const [data,    setData]    = useState<SalesSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  async function load(y: string, m: string) {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams({ year: y });
      if (m) params.set("month", m);
      const res = await fetch(`${API_BASE_URL}sales/summary/?${params}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      setData(await res.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(year, month); }, [year, month]);

  const kpi = data?.kpi;
  const monthly = data?.monthly ?? [];
  const byCategory = data?.by_category ?? [];
  const topRooms = data?.top_rooms ?? [];
  const topServices = data?.top_services ?? [];

  // Pie chart data
  const pieData = byCategory.map((c) => ({
    name:  c.category,
    value: c.revenue,
  }));

  const inputStyle: React.CSSProperties = {
    padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
    fontSize: 13, color: "#1e293b", background: "#fff", outline: "none",
    fontFamily: "inherit", cursor: "pointer",
  };

  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      <div style={{ padding: "36px 40px", overflowY: "auto", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              💰 Sales & Revenue
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* ── Filters ── */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select value={month} onChange={(e) => setMonth(e.target.value)} style={inputStyle}>
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={year} onChange={(e) => setYear(e.target.value)} style={inputStyle}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <button
              onClick={() => load(year, month)}
              style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, cursor: "pointer" }}
            >🔄</button>
          </div>
        </div>

        {error && (
          <div style={{ background: "#fff1f2", color: "#be123c", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>
            Failed to load: {error}
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          {[
            {
              label:    "Total Revenue",
              value:    kpi ? peso(kpi.total_revenue) : null,
              sub:      month ? MONTHS.find(m => m.value === month)?.label : `Full Year ${year}`,
              color:    "#15803d", bg: "#f0fdf4", border: "#bbf7d0", icon: "💵",
            },
            {
              label:    "Transactions",
              value:    kpi ? kpi.total_transactions.toLocaleString() : null,
              sub:      "Total recorded",
              color:    "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe", icon: "🧾",
            },
            {
              label:    "Avg per Transaction",
              value:    kpi ? peso(kpi.avg_transaction) : null,
              sub:      "Per transaction",
              color:    "#7e22ce", bg: "#fdf4ff", border: "#e9d5ff", icon: "📊",
            },
          ].map(({ label, value, sub, color, bg, border, icon }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: "22px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>{label}</div>
                  {loading || !value
                    ? <Skeleton h={32} w="60%" />
                    : <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                  }
                  <div style={{ fontSize: 12, color, opacity: 0.6, marginTop: 6 }}>{sub}</div>
                </div>
                <span style={{ fontSize: 28 }}>{icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Row 1: Bar chart + Pie chart ── */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 20 }}>

          {/* Bar chart — monthly revenue */}
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Monthly Revenue</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>{year} — all months</div>
            {loading ? <Skeleton h={260} /> : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthly} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month_name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Pie chart — by category */}
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Revenue by Category</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 16 }}>Breakdown</div>
            {loading ? <Skeleton h={200} /> : pieData.length === 0 ? (
              <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", fontSize: 13 }}>No data</div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[pieData[i].name] ?? "#94a3b8"} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => peso(v)} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 8 }}>
                  {byCategory.map((c) => (
                    <div key={c.category} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ width: 10, height: 10, borderRadius: 3, background: CATEGORY_COLORS[c.category] ?? "#94a3b8", display: "inline-block" }} />
                        <span style={{ fontSize: 12, color: "#475569" }}>{c.category}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>{c.pct}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Row 2: Line chart (trend) ── */}
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", marginBottom: 20 }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>Revenue Trend</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Revenue and transaction count by month</div>
          {loading ? <Skeleton h={220} /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthly} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month_name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line yAxisId="left"  type="monotone" dataKey="revenue" name="Revenue"      stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="count"   name="Transactions" stroke="#a855f7" strokeWidth={2}   dot={{ r: 3 }} strokeDasharray="5 3" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Row 3: Top Rooms + Top Services ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

          {/* Top Rooms */}
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>🏨 Top Rooms by Revenue</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Based on room booking transactions</div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1,2,3].map(i => <Skeleton key={i} h={44} />)}
              </div>
            ) : topRooms.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No room revenue data</div>
            ) : (
              <div>
                {/* Header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 10, padding: "0 4px" }}>
                  {["Room", "Bookings", "Revenue"].map((h) => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
                  ))}
                </div>
                {topRooms.map((r, i) => (
                  <div key={r.room_id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, padding: "12px 4px", borderTop: "1px solid #f8fafc", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#3b82f6", flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>Room {r.room_number}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{r.type}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{r.bookings}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{peso(r.revenue)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Services */}
          <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a", marginBottom: 4 }}>🛎️ Top Services by Usage</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Non-room transaction categories</div>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[1,2,3].map(i => <Skeleton key={i} h={44} />)}
              </div>
            ) : topServices.length === 0 ? (
              <div style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No service data</div>
            ) : (
              <div>
                {/* Header */}
                <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, marginBottom: 10, padding: "0 4px" }}>
                  {["Category", "Count", "Revenue"].map((h) => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</div>
                  ))}
                </div>
                {topServices.map((s, i) => {
                  const col = CATEGORY_COLORS[s.category] ?? "#64748b";
                  return (
                    <div key={s.category} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 8, padding: "12px 4px", borderTop: "1px solid #f8fafc", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 28, height: 28, borderRadius: 8, background: col + "22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: col, flexShrink: 0 }}>
                          {i + 1}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{s.category}</div>
                      </div>
                      <div style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>{s.count}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#15803d" }}>{peso(s.revenue)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}