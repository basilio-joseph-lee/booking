"use client";

const categories = [
  { label: "Room Bookings", amount: "$31,200", pct: 65 },
  { label: "Spa & Wellness", amount: "$9,600",  pct: 20 },
  { label: "Dining",         amount: "$4,800",  pct: 10 },
  { label: "Others",         amount: "$2,720",  pct: 5  },
];

const monthlySummary = [
  { month: "January",  revenue: "$38,400" },
  { month: "February", revenue: "$41,900" },
  { month: "March",    revenue: "$48,320" },
];

export default function SalesPage() {
  return (
    <div style={{ padding: "36px 40px", overflowY: "auto", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0 }}>Sales</h1>
        <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 4 }}>
          Welcome back, Admin ·{" "}
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Revenue by Category */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "#111827" }}>Revenue by Category</div>
          {categories.map((row, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{row.label}</span>
                <span style={{ fontSize: 14, color: "#111827", fontWeight: 700 }}>{row.amount}</span>
              </div>
              <div style={{ height: 8, background: "#f3f4f6", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${row.pct}%`, background: "#2563eb", borderRadius: 99 }} />
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Summary */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "#111827" }}>Monthly Summary</div>
          {monthlySummary.map((row, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: i < monthlySummary.length - 1 ? "1px solid #f3f4f6" : "none" }}>
              <span style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{row.month}</span>
              <span style={{ fontSize: 14, color: "#16a34a", fontWeight: 700 }}>{row.revenue}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}