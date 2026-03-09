"use client";

import { useState } from "react";

const tabs = ["Dashboard", "Appointment", "Room", "Sales"];

const tabContent: Record<string, React.ReactNode> = {
  Dashboard: (
    <div className="grid grid-cols-3 gap-6">
      {[
        { label: "Total Bookings", value: "1,284", change: "+12%", color: "#2563eb" },
        { label: "Revenue", value: "$48,320", change: "+8%", color: "#16a34a" },
        { label: "Occupancy Rate", value: "87%", change: "+3%", color: "#d97706" },
      ].map((stat) => (
        <div key={stat.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 13, color: "#6b7280", fontWeight: 600, textTransform: "uppercase", letterSpacing: 1 }}>{stat.label}</div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "8px 0 4px" }}>{stat.value}</div>
          <div style={{ fontSize: 13, color: stat.color, fontWeight: 600 }}>{stat.change} this month</div>
        </div>
      ))}
      <div style={{ gridColumn: "1/-1", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: "#111827" }}>Recent Activity</div>
        {["Room 204 checked in — John Dela Cruz", "Room 117 checkout — Maria Santos", "New appointment: Spa @ 3PM", "Room 305 housekeeping complete"].map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none" }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563eb", flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: "#374151" }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  ),
  Appointment: (
    <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "#111827" }}>Today's Appointments</div>
      {[
        { time: "9:00 AM", guest: "Ana Reyes", type: "Check-in", room: "101", status: "Confirmed" },
        { time: "11:30 AM", guest: "Ben Torres", type: "Spa Session", room: "Spa A", status: "Pending" },
        { time: "2:00 PM", guest: "Carla Lim", type: "Check-out", room: "208", status: "Confirmed" },
        { time: "4:00 PM", guest: "Dan Cruz", type: "Check-in", room: "315", status: "Confirmed" },
      ].map((appt, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "90px 1fr 80px 80px 100px", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: i < 3 ? "1px solid #f3f4f6" : "none" }}>
          <span style={{ fontWeight: 700, color: "#2563eb", fontSize: 14 }}>{appt.time}</span>
          <span style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>{appt.guest}</span>
          <span style={{ fontSize: 13, color: "#6b7280" }}>{appt.type}</span>
          <span style={{ fontSize: 13, color: "#6b7280" }}>Rm {appt.room}</span>
          <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: appt.status === "Confirmed" ? "#dcfce7" : "#fef9c3", color: appt.status === "Confirmed" ? "#16a34a" : "#a16207", textAlign: "center" }}>{appt.status}</span>
        </div>
      ))}
    </div>
  ),
  Room: (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
      {Array.from({ length: 12 }, (_, i) => {
        const statuses = ["Available", "Occupied", "Housekeeping", "Maintenance"];
        const colors: Record<string, string> = { Available: "#dcfce7", Occupied: "#dbeafe", Housekeeping: "#fef9c3", Maintenance: "#fee2e2" };
        const textColors: Record<string, string> = { Available: "#16a34a", Occupied: "#1d4ed8", Housekeeping: "#a16207", Maintenance: "#dc2626" };
        const status = statuses[i % 4];
        return (
          <div key={i} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: "20px 18px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontWeight: 800, fontSize: 20, color: "#111827" }}>Room {100 + (i + 1) * 11}</div>
            <div style={{ fontSize: 12, color: "#6b7280", margin: "4px 0 12px" }}>Floor {Math.floor(i / 4) + 1} · {["Deluxe", "Suite", "Standard"][i % 3]}</div>
            <span style={{ fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99, background: colors[status], color: textColors[status] }}>{status}</span>
          </div>
        );
      })}
    </div>
  ),
  Sales: (
    <div className="grid grid-cols-2 gap-6">
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "#111827" }}>Revenue by Category</div>
        {[
          { label: "Room Bookings", amount: "$31,200", pct: 65 },
          { label: "Spa & Wellness", amount: "$9,600", pct: 20 },
          { label: "Dining", amount: "$4,800", pct: 10 },
          { label: "Others", amount: "$2,720", pct: 5 },
        ].map((row, i) => (
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
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: "#111827" }}>Monthly Summary</div>
        {[
          { month: "January", revenue: "$38,400" },
          { month: "February", revenue: "$41,900" },
          { month: "March", revenue: "$48,320" },
        ].map((row, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "14px 0", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none" }}>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{row.month}</span>
            <span style={{ fontSize: 14, color: "#16a34a", fontWeight: 700 }}>{row.revenue}</span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f8fafc" }}>
      {/* Sidebar */}
      <div style={{ background: "#fff", borderRight: "1px solid #e5e7eb", padding: "32px 0", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, paddingBottom: 24, borderBottom: "1px solid #f3f4f6", marginBottom: 8 }}>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Booking.com_Icon_2022.svg"
            width={52}
            height={52}
            alt="Logo"
            style={{ borderRadius: 12 }}
          />
          <span style={{ fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: 0.3 }}>Admin Panel</span>
        </div>

        <nav style={{ display: "flex", flexDirection: "column", padding: "8px 16px", gap: 4 }}>
          {tabs.map((tab) => {
            const icons: Record<string, string> = {
              Dashboard: "⊞",
              Appointment: "📅",
              Room: "🛏",
              Sales: "📊",
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "11px 16px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: isActive ? "#2563eb" : "transparent",
                  color: isActive ? "#fff" : "#6b7280",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 14,
                  transition: "all 0.15s ease",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 16 }}>{icons[tab]}</span>
                {tab}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ padding: "36px 40px", overflowY: "auto" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0 }}>{activeTab}</h1>
          <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 4 }}>Welcome back, Admin · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
        </div>
        {tabContent[activeTab]}
      </div>
    </div>
  );
}