"use client"
import {useState} from "react";

const tables = {
  users: {
    name: "users",
    color: "#3B82F6",
    icon: "👤",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "name", type: "VARCHAR(100)" },
      { name: "email", type: "VARCHAR(150)", unique: true },
      { name: "role", type: "ENUM(admin,staff,guest)" },
      { name: "password_hash", type: "VARCHAR(255)" },
      { name: "avatar_url", type: "TEXT", nullable: true },
      { name: "is_active", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
    note: "Central auth table for all roles",
  },
  rooms: {
    name: "rooms",
    color: "#10B981",
    icon: "🛏️",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "room_number", type: "VARCHAR(10)", unique: true },
      { name: "floor", type: "INT" },
      { name: "type", type: "ENUM(Standard,Deluxe,Suite)" },
      { name: "status", type: "ENUM(Available,Occupied,Housekeeping,Maintenance)" },
      { name: "price_per_night", type: "DECIMAL(10,2)" },
      { name: "max_occupancy", type: "INT" },
      { name: "description", type: "TEXT", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
      { name: "updated_at", type: "TIMESTAMP" },
    ],
    note: "Room inventory with real-time status",
  },
  guests: {
    name: "guests",
    color: "#8B5CF6",
    icon: "🧳",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: "users.id", nullable: true },
      { name: "full_name", type: "VARCHAR(150)" },
      { name: "email", type: "VARCHAR(150)" },
      { name: "phone", type: "VARCHAR(20)" },
      { name: "id_type", type: "VARCHAR(50)", nullable: true },
      { name: "id_number", type: "VARCHAR(100)", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    note: "Guest profiles, optionally linked to user accounts",
  },
  bookings: {
    name: "bookings",
    color: "#F59E0B",
    icon: "📋",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "guest_id", type: "UUID", fk: "guests.id" },
      { name: "room_id", type: "UUID", fk: "rooms.id" },
      { name: "check_in_date", type: "DATE" },
      { name: "check_out_date", type: "DATE" },
      { name: "status", type: "ENUM(Confirmed,Pending,Cancelled,Completed)" },
      { name: "total_amount", type: "DECIMAL(10,2)" },
      { name: "notes", type: "TEXT", nullable: true },
      { name: "created_by", type: "UUID", fk: "users.id" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    note: "Core booking record linking guests & rooms",
  },
  appointments: {
    name: "appointments",
    color: "#EC4899",
    icon: "📅",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "guest_id", type: "UUID", fk: "guests.id" },
      { name: "booking_id", type: "UUID", fk: "bookings.id", nullable: true },
      { name: "service_type", type: "ENUM(Check-in,Check-out,Spa Session,Dining,Other)" },
      { name: "room_id", type: "UUID", fk: "rooms.id", nullable: true },
      { name: "scheduled_at", type: "TIMESTAMP" },
      { name: "status", type: "ENUM(Confirmed,Pending,Cancelled,Completed)" },
      { name: "assigned_staff", type: "UUID", fk: "users.id", nullable: true },
      { name: "notes", type: "TEXT", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    note: "Spa, check-in/out, and service appointments",
  },
  transactions: {
    name: "transactions",
    color: "#14B8A6",
    icon: "💰",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "booking_id", type: "UUID", fk: "bookings.id", nullable: true },
      { name: "guest_id", type: "UUID", fk: "guests.id" },
      { name: "category", type: "ENUM(Room Bookings,Spa & Wellness,Dining,Others)" },
      { name: "amount", type: "DECIMAL(10,2)" },
      { name: "description", type: "TEXT", nullable: true },
      { name: "transaction_date", type: "DATE" },
      { name: "created_by", type: "UUID", fk: "users.id" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    note: "Revenue tracking per category for sales reports",
  },
  activity_logs: {
    name: "activity_logs",
    color: "#6B7280",
    icon: "📝",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "user_id", type: "UUID", fk: "users.id" },
      { name: "action", type: "VARCHAR(255)" },
      { name: "entity_type", type: "VARCHAR(50)", nullable: true },
      { name: "entity_id", type: "UUID", nullable: true },
      { name: "metadata", type: "JSONB", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    note: "Tracks all recent activity shown in dashboard",
  },
  chat_conversations: {
    name: "chat_conversations",
    color: "#F97316",
    icon: "💬",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "title", type: "VARCHAR(255)", nullable: true },
      { name: "type", type: "ENUM(direct,group,support)" },
      { name: "guest_id", type: "UUID", fk: "guests.id", nullable: true },
      { name: "booking_id", type: "UUID", fk: "bookings.id", nullable: true },
      { name: "created_by", type: "UUID", fk: "users.id" },
      { name: "last_message_at", type: "TIMESTAMP", nullable: true },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    note: "Chat threads (staff-to-guest or internal)",
  },
  chat_participants: {
    name: "chat_participants",
    color: "#F97316",
    icon: "👥",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "conversation_id", type: "UUID", fk: "chat_conversations.id" },
      { name: "user_id", type: "UUID", fk: "users.id" },
      { name: "joined_at", type: "TIMESTAMP" },
      { name: "last_read_at", type: "TIMESTAMP", nullable: true },
    ],
    note: "Many-to-many for conversation members",
  },
  chat_messages: {
    name: "chat_messages",
    color: "#F97316",
    icon: "✉️",
    fields: [
      { name: "id", type: "UUID", pk: true },
      { name: "conversation_id", type: "UUID", fk: "chat_conversations.id" },
      { name: "sender_id", type: "UUID", fk: "users.id" },
      { name: "content", type: "TEXT" },
      { name: "message_type", type: "ENUM(text,image,file,system)" },
      { name: "attachment_url", type: "TEXT", nullable: true },
      { name: "is_deleted", type: "BOOLEAN" },
      { name: "created_at", type: "TIMESTAMP" },
    ],
    note: "Individual messages with attachment support",
  },
};

const recommendations = [
  {
    icon: "🔐",
    title: "Role-Based Access Control (RBAC)",
    color: "#3B82F6",
    points: [
      "Add a roles table with permissions JSON for fine-grained control",
      "Admin, Receptionist, Housekeeping, Spa Staff roles",
      "Gate API endpoints by role middleware",
    ],
  },
  {
    icon: "📊",
    title: "Analytics & Reporting",
    color: "#10B981",
    points: [
      "Add a daily_metrics materialized view for dashboard KPIs",
      "Store monthly_snapshots to power the Sales Monthly Summary",
      "Track occupancy_rate as a computed column or scheduled job",
    ],
  },
  {
    icon: "💬",
    title: "Chat System Design",
    color: "#F97316",
    points: [
      "Use WebSockets (Socket.io / Pusher) for real-time delivery",
      "Add read receipts via last_read_at in chat_participants",
      "Support guest-to-staff chat tied to a booking_id for context",
      "Add notification_preferences table for push/email/SMS settings",
    ],
  },
  {
    icon: "🔔",
    title: "Notifications",
    color: "#8B5CF6",
    points: [
      "notifications table: user_id, type, message, read_at, entity_id",
      "Trigger on: booking status change, new message, appointment reminder",
      "Support in-app + email + SMS channels",
    ],
  },
  {
    icon: "🛡️",
    title: "Data Integrity",
    color: "#EF4444",
    points: [
      "Add DB-level constraints: check_out > check_in on bookings",
      "Prevent double-booking with unique partial index on room_id + dates",
      "Soft delete (deleted_at) instead of hard delete for audit trail",
    ],
  },
  {
    icon: "⚡",
    title: "Performance",
    color: "#14B8A6",
    points: [
      "Index: rooms.status, bookings.check_in_date, transactions.transaction_date",
      "Use JSONB for metadata in activity_logs for flexible querying",
      "Consider Redis for real-time room status and chat presence",
    ],
  },
];

export default function HotelERD() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeTab, setActiveTab] = useState("erd");

  const tableList = Object.values(tables);
  const groups = [
    { label: "Core", keys: ["users", "guests", "rooms"] },
    { label: "Operations", keys: ["bookings", "appointments", "transactions"] },
    { label: "System", keys: ["activity_logs"] },
    { label: "Chat System", keys: ["chat_conversations", "chat_participants", "chat_messages"] },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#0F172A", minHeight: "100vh", color: "#E2E8F0" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)", borderBottom: "1px solid #1E293B", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: "#3B82F6", borderRadius: 10, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "white" }}>B.</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#F1F5F9" }}>Hotel Admin Panel — Database Design</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>ERD + Recommendations for Chat System Integration</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {["erd", "recommendations"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13, textTransform: "capitalize",
                background: activeTab === tab ? "#3B82F6" : "#1E293B", color: activeTab === tab ? "white" : "#94A3B8", transition: "all 0.2s" }}>
              {tab === "erd" ? "📐 ERD Tables" : "💡 Recommendations"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "erd" ? (
        <div style={{ display: "flex", height: "calc(100vh - 81px)" }}>
          {/* Sidebar */}
          <div style={{ width: 220, background: "#1E293B", borderRight: "1px solid #334155", overflow: "auto", padding: 16 }}>
            <div style={{ fontSize: 11, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Tables ({tableList.length})</div>
            {groups.map(group => (
              <div key={group.label} style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, paddingLeft: 4 }}>{group.label}</div>
                {group.keys.map(key => {
                  const t = tables[key];
                  return (
                    <button key={key} onClick={() => setSelectedTable(selectedTable === key ? null : key)}
                      style={{ width: "100%", textAlign: "left", padding: "8px 10px", borderRadius: 6, border: `1px solid ${selectedTable === key ? t.color : "transparent"}`,
                        background: selectedTable === key ? `${t.color}18` : "transparent", color: selectedTable === key ? t.color : "#94A3B8",
                        cursor: "pointer", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, marginBottom: 2, transition: "all 0.15s" }}>
                      <span>{t.icon}</span>{t.name}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
            {!selectedTable ? (
              <div>
                <div style={{ marginBottom: 20, color: "#64748B", fontSize: 13 }}>
                  Click a table to inspect its schema. Below is the full ERD overview.
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
                  {tableList.map(t => (
                    <div key={t.name} onClick={() => setSelectedTable(t.name)}
                      style={{ background: "#1E293B", border: `1px solid #334155`, borderRadius: 12, padding: 16, cursor: "pointer",
                        transition: "all 0.2s", borderTop: `3px solid ${t.color}` }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = t.color; e.currentTarget.style.background = "#253047"; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = "#334155"; e.currentTarget.style.borderTopColor = t.color; e.currentTarget.style.background = "#1E293B"; }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 18 }}>{t.icon}</span>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: t.color }}>{t.name}</div>
                          <div style={{ fontSize: 11, color: "#475569" }}>{t.fields.length} fields</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 10, fontStyle: "italic" }}>{t.note}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {t.fields.slice(0, 5).map(f => (
                          <span key={f.name} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 4, background: f.pk ? `${t.color}30` : f.fk ? "#7C3AED20" : "#0F172A",
                            color: f.pk ? t.color : f.fk ? "#A78BFA" : "#64748B", border: `1px solid ${f.pk ? t.color + "50" : f.fk ? "#7C3AED40" : "#1E293B"}` }}>
                            {f.pk ? "🔑 " : f.fk ? "🔗 " : ""}{f.name}
                          </span>
                        ))}
                        {t.fields.length > 5 && <span style={{ fontSize: 10, color: "#475569" }}>+{t.fields.length - 5} more</span>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Relationship Summary */}
                <div style={{ marginTop: 24, background: "#1E293B", borderRadius: 12, padding: 20, border: "1px solid #334155" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: "#F1F5F9", marginBottom: 16 }}>🔗 Key Relationships</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 8 }}>
                    {[
                      { from: "guests", to: "users", label: "optionally linked to", type: "0..1 : 1" },
                      { from: "bookings", to: "guests", label: "belongs to", type: "N : 1" },
                      { from: "bookings", to: "rooms", label: "reserves", type: "N : 1" },
                      { from: "appointments", to: "guests", label: "scheduled for", type: "N : 1" },
                      { from: "appointments", to: "bookings", label: "associated with", type: "N : 0..1" },
                      { from: "transactions", to: "bookings", label: "billed to", type: "N : 0..1" },
                      { from: "activity_logs", to: "users", label: "performed by", type: "N : 1" },
                      { from: "chat_conversations", to: "bookings", label: "context for", type: "N : 0..1" },
                      { from: "chat_participants", to: "chat_conversations", label: "member of", type: "N : 1" },
                      { from: "chat_messages", to: "chat_conversations", label: "belongs to", type: "N : 1" },
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 10px", background: "#0F172A", borderRadius: 8 }}>
                        <span style={{ color: tables[r.from]?.color, fontWeight: 700, fontSize: 11 }}>{r.from}</span>
                        <span style={{ color: "#475569", fontSize: 11 }}>→ {r.label} →</span>
                        <span style={{ color: tables[r.to]?.color, fontWeight: 700, fontSize: 11 }}>{r.to}</span>
                        <span style={{ marginLeft: "auto", fontSize: 10, color: "#334155", background: "#1E293B", padding: "2px 5px", borderRadius: 4 }}>{r.type}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <button onClick={() => setSelectedTable(null)} style={{ background: "#1E293B", border: "1px solid #334155", color: "#94A3B8", padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, marginBottom: 20 }}>
                  ← Back to Overview
                </button>
                {(() => {
                  const t = tables[selectedTable];
                  return (
                    <div style={{ maxWidth: 700 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ background: `${t.color}20`, border: `1px solid ${t.color}40`, borderRadius: 10, padding: "10px 14px", fontSize: 24 }}>{t.icon}</div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 22, color: t.color }}>{t.name}</div>
                          <div style={{ fontSize: 13, color: "#64748B" }}>{t.note}</div>
                        </div>
                      </div>
                      <div style={{ background: "#1E293B", borderRadius: 12, overflow: "hidden", border: "1px solid #334155" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px", padding: "10px 16px", background: "#0F172A", fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                          <span>Column</span><span>Type</span><span>PK</span><span>FK / Ref</span>
                        </div>
                        {t.fields.map((f, i) => (
                          <div key={f.name} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px", padding: "11px 16px", borderTop: "1px solid #0F172A",
                            background: i % 2 === 0 ? "#1E293B" : "#1A2744" }}>
                            <span style={{ fontWeight: 600, fontSize: 13, color: f.pk ? t.color : "#E2E8F0" }}>
                              {f.pk ? "🔑 " : ""}{f.name}
                              {f.nullable && <span style={{ color: "#475569", fontSize: 10, marginLeft: 4 }}>?</span>}
                              {f.unique && <span style={{ color: "#F59E0B", fontSize: 10, marginLeft: 4 }}>UNIQUE</span>}
                            </span>
                            <span style={{ fontSize: 12, color: "#64748B", fontFamily: "monospace" }}>{f.type}</span>
                            <span style={{ fontSize: 12, color: f.pk ? "#F59E0B" : "#334155" }}>{f.pk ? "✓" : "—"}</span>
                            <span style={{ fontSize: 11, color: "#A78BFA" }}>{f.fk ? `→ ${f.fk}` : "—"}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 16, padding: 14, background: "#1E293B", borderRadius: 10, border: `1px solid ${t.color}30` }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: t.color, marginBottom: 6 }}>LEGEND</div>
                        <div style={{ display: "flex", gap: 16, fontSize: 11, color: "#64748B" }}>
                          <span>🔑 Primary Key</span>
                          <span>🔗 Foreign Key (→ table.field)</span>
                          <span><span style={{ color: "#475569" }}>?</span> Nullable</span>
                          <span><span style={{ color: "#F59E0B" }}>UNIQUE</span> Unique constraint</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ padding: 32, maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#F1F5F9", marginBottom: 6 }}>💡 Architecture Recommendations</div>
          <div style={{ fontSize: 13, color: "#64748B", marginBottom: 28 }}>Before you build — key decisions that will save you from refactoring later.</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(440px, 1fr))", gap: 20 }}>
            {recommendations.map((r, i) => (
              <div key={i} style={{ background: "#1E293B", borderRadius: 14, padding: 22, border: `1px solid #334155`, borderLeft: `4px solid ${r.color}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: 22 }}>{r.icon}</span>
                  <div style={{ fontWeight: 700, fontSize: 15, color: r.color }}>{r.title}</div>
                </div>
                <ul style={{ margin: 0, paddingLeft: 0, listStyle: "none" }}>
                  {r.points.map((p, j) => (
                    <li key={j} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "#94A3B8", lineHeight: 1.5 }}>
                      <span style={{ color: r.color, marginTop: 2, flexShrink: 0 }}>▸</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Stack suggestion */}
          <div style={{ marginTop: 28, background: "#1E293B", borderRadius: 14, padding: 24, border: "1px solid #334155" }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: "#F1F5F9", marginBottom: 16 }}>🚀 Recommended Tech Stack</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
              {[
                { layer: "Frontend", tech: "Next.js 14 + React", color: "#3B82F6" },
                { layer: "Styling", tech: "Tailwind CSS + shadcn/ui", color: "#8B5CF6" },
                { layer: "Backend", tech: "Node.js / Express or tRPC", color: "#10B981" },
                { layer: "Database", tech: "PostgreSQL (Supabase)", color: "#F59E0B" },
                { layer: "Real-time Chat", tech: "Socket.io or Supabase Realtime", color: "#F97316" },
                { layer: "Auth", tech: "NextAuth.js / Clerk", color: "#EC4899" },
                { layer: "File Storage", tech: "Cloudflare R2 / S3", color: "#14B8A6" },
                { layer: "Notifications", tech: "Novu / Resend (email)", color: "#EF4444" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "12px 14px", background: "#0F172A", borderRadius: 10, border: `1px solid ${s.color}30` }}>
                  <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>{s.layer}</div>
                  <div style={{ fontSize: 13, color: s.color, fontWeight: 600 }}>{s.tech}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}