"use client";

import { useEffect, useState, useRef } from "react";
import { Room, CreateRoomPayload, UpdateRoomPayload } from "@/types/room";
import { getRooms, createRoom, updateRoom, deleteRoom } from "@/services/roomService";
import { useToast } from "@/hooks/useToast";
import { API_BASE_URL } from "@/config/api";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface OccupancyGuest {
  guest_id: number;
  name:     string;
  email:    string;
  phone:    string;
}

interface OccupancyBooking {
  booking_id:       number;
  room_status:      string;
  check_in:         string;
  check_out:        string;
  nights_remaining: number;
  guest:            OccupancyGuest;
}

interface NextBooking {
  booking_id: number;
  guest_name: string;
  check_in:   string;
  check_out:  string;
}

interface OccupancyRoom {
  room_id:         number;
  room_number:     string;
  floor:           number;
  type:            string;
  price_per_night: string;
  max_occupancy:   number;
  image_url:       string | null;
  room_status:     string;
  next_booking:    NextBooking | null;
  booking:         OccupancyBooking | null;
}

interface OccupancySummary {
  date:               string;
  total_rooms:        number;
  occupied:           number;
  vacant:             number;
  pending:            number;
  housekeeping:       number;
  maintenance:        number;
  checked_out:        number;
  checking_in_today:  number;
  checking_out_today: number;
}

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const TYPES = ["Standard", "Deluxe", "Suite"];

const STATUS_STYLE: Record<string, { bg: string; color: string; dot: string; border: string }> = {
  Occupied:      { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6", border: "#bfdbfe" },
  Vacant:        { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e", border: "#bbf7d0" },
  Pending:       { bg: "#fefce8", color: "#a16207", dot: "#eab308", border: "#fde047" },
  Housekeeping:  { bg: "#fdf4ff", color: "#7e22ce", dot: "#a855f7", border: "#e9d5ff" },
  Maintenance:   { bg: "#fff1f2", color: "#be123c", dot: "#f43f5e", border: "#fecdd3" },
  "Checked Out": { bg: "#f1f5f9", color: "#475569", dot: "#94a3b8", border: "#e2e8f0" },
  Available:     { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e", border: "#bbf7d0" },
};

const DEFAULT_FORM: CreateRoomPayload = {
  room_number:     "",
  floor:           1,
  type:            "Standard",
  price_per_night: "",
  max_occupancy:   1,
  image_url:       "",
  description:     "",
};

const OCC_STATUSES = ["Occupied", "Vacant", "Pending", "Housekeeping", "Maintenance", "Checked Out"];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// ─── STATUS BADGE ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] ?? { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden" }}>
      <div style={{ height: 140, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite" }} />
      <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
        {[70, 50, 40].map((w, i) => (
          <div key={i} style={{ height: i === 0 ? 18 : 11, width: `${w}%`, borderRadius: 6, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite" }} />
        ))}
      </div>
    </div>
  );
}

// ─── IMAGE UPLOADER ──────────────────────────────────────────────────────────

function ImageUploader({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [mode, setMode]         = useState<"url" | "upload">("url");
  const [imgError, setImgError] = useState(false);
  const fileRef                 = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      onChange(ev.target?.result as string);
      setImgError(false);
    };
    reader.readAsDataURL(file);
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b",
    background: "#f8fafc", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  return (
    <div>
      {/* Toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        {(["url", "upload"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            style={{
              padding: "5px 14px", borderRadius: 8, border: "1px solid",
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
              borderColor: mode === m ? "#0f172a" : "#e2e8f0",
              background:  mode === m ? "#0f172a" : "#fff",
              color:       mode === m ? "#fff"    : "#64748b",
            }}
          >
            {m === "url" ? "🔗 Image URL" : "📁 Upload File"}
          </button>
        ))}
      </div>

      {/* URL input */}
      {mode === "url" && (
        <input
          style={inputStyle}
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => { onChange(e.target.value); setImgError(false); }}
          placeholder="https://example.com/room.jpg"
        />
      )}

      {/* File upload dropzone */}
      {mode === "upload" && (
        <div
          onClick={() => fileRef.current?.click()}
          style={{ border: "2px dashed #e2e8f0", borderRadius: 12, padding: "20px", textAlign: "center", cursor: "pointer", background: "#f8fafc", transition: "border-color 0.15s" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#94a3b8")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#e2e8f0")}
        >
          <div style={{ fontSize: 24, marginBottom: 6 }}>🖼️</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Click to choose a photo</div>
          <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>JPG, PNG, WEBP supported</div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        </div>
      )}

      {/* Card preview */}
      {value && !imgError && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
            Preview on Card
          </div>
          <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ height: 140, position: "relative", background: "#f1f5f9" }}>
              <img
                src={value}
                alt="Room preview"
                onError={() => setImgError(true)}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
              <div style={{ position: "absolute", top: 8, right: 8, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#f0fdf4", color: "#15803d" }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e" }} /> Vacant
              </div>
            </div>
            <div style={{ padding: "12px 14px", background: "#fff" }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#0f172a" }}>Room Preview</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>This is how the image will appear on the room card</div>
            </div>
          </div>
          <button
            onClick={() => { onChange(""); setImgError(false); if (fileRef.current) fileRef.current.value = ""; }}
            style={{ marginTop: 8, fontSize: 12, color: "#f43f5e", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontWeight: 600 }}
          >
            ✕ Remove image
          </button>
        </div>
      )}

      {value && imgError && (
        <div style={{ marginTop: 8, borderRadius: 10, border: "1px dashed #fca5a5", background: "#fff1f2", height: 60, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#f87171" }}>
          ⚠️ Could not load image — check the URL
        </div>
      )}
    </div>
  );
}

// ─── OCCUPANCY CARD ──────────────────────────────────────────────────────────

function OccupancyCard({ room, onClick }: { room: OccupancyRoom; onClick: () => void }) {
  const [imgErr, setImgErr] = useState(false);
  const s = STATUS_STYLE[room.room_status] ?? STATUS_STYLE["Vacant"];

  return (
    <div
      onClick={onClick}
      style={{ background: "#fff", border: `1px solid ${s.border}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", transition: "all 0.15s", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; }}
    >
      <div style={{ height: 140, background: "#f1f5f9", position: "relative", overflow: "hidden" }}>
        {room.image_url && !imgErr ? (
          <img src={room.image_url} alt={`Room ${room.room_number}`} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#cbd5e1", gap: 6 }}>
            <span style={{ fontSize: 32 }}>🏨</span>
            <span style={{ fontSize: 11 }}>No image</span>
          </div>
        )}
        <div style={{ position: "absolute", top: 8, right: 8 }}>
          <StatusBadge status={room.room_status} />
        </div>
      </div>

      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Room {room.room_number}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Floor {room.floor} · {room.type}</div>
        <div style={{ marginTop: 10, fontSize: 12, color: s.color, display: "flex", alignItems: "center", gap: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, display: "inline-block", flexShrink: 0 }} />
          {room.room_status === "Occupied"     && `Guest staying · ${room.booking?.nights_remaining}n left`}
          {room.room_status === "Pending"      && "Booked · Awaiting arrival"}
          {room.room_status === "Vacant"       && (room.next_booking ? "Next booking scheduled" : "No upcoming bookings")}
          {room.room_status === "Housekeeping" && "Being cleaned"}
          {room.room_status === "Maintenance"  && "Under maintenance"}
          {room.room_status === "Checked Out"  && "Checked out today"}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: "#cbd5e1", fontStyle: "italic" }}>Tap to view details →</div>
      </div>
    </div>
  );
}

// ─── MANAGE CARD ─────────────────────────────────────────────────────────────

function ManageCard({ room, onEdit, onDelete }: { room: Room; onEdit: () => void; onDelete: () => void }) {
  const [imgErr, setImgErr] = useState(false);

  return (
    <div
      style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.15s" }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 24px rgba(0,0,0,0.08)"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; }}
    >
      <div style={{ height: 140, background: "#f1f5f9", position: "relative", overflow: "hidden" }}>
        {room.image_url && !imgErr ? (
          <img src={room.image_url} alt={`Room ${room.room_number}`} onError={() => setImgErr(true)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#cbd5e1", gap: 6 }}>
            <span style={{ fontSize: 32 }}>🏨</span>
            <span style={{ fontSize: 11 }}>No image</span>
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px" }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: "#0f172a" }}>Room {room.room_number}</div>
        <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Floor {room.floor} · {room.type}</div>
        <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>
          👥 {room.max_occupancy} pax · ₱{parseFloat(room.price_per_night).toLocaleString()}/night
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6, marginTop: 12 }}>
          <button onClick={onEdit} title="Edit"
            style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} title="Delete"
            style={{ width: 30, height: 30, borderRadius: 8, border: "1px solid #fecdd3", background: "#fff1f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── OCCUPANCY MODAL ─────────────────────────────────────────────────────────

function OccupancyModal({ room, onClose, onStatusUpdate }: {
  room:           OccupancyRoom;
  onClose:        () => void;
  onStatusUpdate: (roomId: number, newStatus: string) => Promise<void>;
}) {
  const [updating, setUpdating] = useState(false);

  async function handleStatusUpdate(newStatus: string) {
    setUpdating(true);
    await onStatusUpdate(room.room_id, newStatus);
    setUpdating(false);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 420, boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden" }}>

        {/* Image header */}
        <div style={{ height: 160, background: "#f1f5f9", position: "relative", overflow: "hidden" }}>
          {room.image_url ? (
            <img src={room.image_url} alt={`Room ${room.room_number}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🏨</div>
          )}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)" }} />
          <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>Room {room.room_number}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.75)", marginTop: 1 }}>
                Floor {room.floor} · {room.type} · ₱{parseFloat(room.price_per_night).toLocaleString()}/night
              </div>
            </div>
            <StatusBadge status={room.room_status} />
          </div>
          <button onClick={onClose}
            style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,0.4)", border: "none", borderRadius: 8, width: 30, height: 30, cursor: "pointer", fontSize: 14, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px 24px" }}>

          {/* OCCUPIED */}
          {room.room_status === "Occupied" && room.booking && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 14 }}>Current Guest</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Guest",    value: room.booking.guest.name,           bold: true  },
                  { label: "Booking #", value: `#${room.booking.booking_id}`,    bold: true  },
                  { label: "Check-in",  value: formatDate(room.booking.check_in), bold: false },
                  { label: "Check-out", value: formatDate(room.booking.check_out),bold: false },
                  { label: "Email",     value: room.booking.guest.email,          bold: false },
                  { label: "Phone",     value: room.booking.guest.phone,          bold: false },
                ].map(({ label, value, bold }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: "#0f172a" }}>{value}</span>
                  </div>
                ))}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>Nights Remaining</span>
                  <span style={{ fontSize: 15, fontWeight: 800, color: "#3b82f6" }}>
                    {room.booking.nights_remaining} night{room.booking.nights_remaining !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PENDING */}
          {room.room_status === "Pending" && room.booking && (
            <div>
              <div style={{ background: "#fefce8", border: "1px solid #fde047", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#a16207", fontWeight: 600 }}>
                ⏳ Guest booked but has not yet arrived
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Guest",             value: room.booking.guest.name,            bold: true  },
                  { label: "Booking #",          value: `#${room.booking.booking_id}`,      bold: true  },
                  { label: "Expected Check-in",  value: formatDate(room.booking.check_in),  bold: false },
                  { label: "Check-out",          value: formatDate(room.booking.check_out), bold: false },
                ].map(({ label, value, bold }) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                    <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: "#0f172a" }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOUSEKEEPING */}
          {room.room_status === "Housekeeping" && (
            <div>
              <div style={{ background: "#fdf4ff", border: "1px solid #e9d5ff", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#7e22ce", fontWeight: 600 }}>
                🧹 Room is currently being cleaned
              </div>
              {room.booking && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>Last Guest</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{room.booking.guest.name}</span>
                </div>
              )}
              <button onClick={() => handleStatusUpdate("Available")} disabled={updating}
                style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: updating ? "#94a3b8" : "#22c55e", color: "#fff", fontSize: 13, fontWeight: 700, cursor: updating ? "not-allowed" : "pointer" }}>
                {updating ? "Updating…" : "✅ Mark as Available"}
              </button>
            </div>
          )}

          {/* MAINTENANCE */}
          {room.room_status === "Maintenance" && (
            <div>
              <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#be123c", fontWeight: 600 }}>
                🔧 Room is under maintenance
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button onClick={() => handleStatusUpdate("Available")} disabled={updating}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: updating ? "#94a3b8" : "#22c55e", color: "#fff", fontSize: 13, fontWeight: 700, cursor: updating ? "not-allowed" : "pointer" }}>
                  {updating ? "Updating…" : "✅ Mark as Available"}
                </button>
                <button onClick={() => handleStatusUpdate("Housekeeping")} disabled={updating}
                  style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: updating ? "#94a3b8" : "#a855f7", color: "#fff", fontSize: 13, fontWeight: 700, cursor: updating ? "not-allowed" : "pointer" }}>
                  {updating ? "Updating…" : "🧹 Mark as Housekeeping"}
                </button>
              </div>
            </div>
          )}

          {/* VACANT */}
          {room.room_status === "Vacant" && (
            <div>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#15803d", fontWeight: 600 }}>
                ✅ Room is clean and available
              </div>
              {room.next_booking ? (
                <>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>Next Booking</div>
                  {[
                    { label: "Guest",     value: room.next_booking.guest_name, bold: true  },
                    { label: "Check-in",  value: formatDate(room.next_booking.check_in),  bold: false },
                    { label: "Check-out", value: formatDate(room.next_booking.check_out), bold: false },
                  ].map(({ label, value, bold }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#94a3b8" }}>{label}</span>
                      <span style={{ fontSize: 13, fontWeight: bold ? 700 : 500, color: "#0f172a" }}>{value}</span>
                    </div>
                  ))}
                </>
              ) : (
                <div style={{ fontSize: 13, color: "#94a3b8", textAlign: "center", padding: "8px 0" }}>No upcoming bookings</div>
              )}
            </div>
          )}

          {/* CHECKED OUT */}
          {room.room_status === "Checked Out" && (
            <div>
              <div style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 10, padding: "11px 14px", marginBottom: 16, fontSize: 13, color: "#475569", fontWeight: 600 }}>
                🚪 Guest has checked out today
              </div>
              {room.booking && (
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: 13, color: "#94a3b8" }}>Last Guest</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>{room.booking.guest.name}</span>
                </div>
              )}
              <button onClick={() => handleStatusUpdate("Housekeeping")} disabled={updating}
                style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: updating ? "#94a3b8" : "#a855f7", color: "#fff", fontSize: 13, fontWeight: 700, cursor: updating ? "not-allowed" : "pointer" }}>
                {updating ? "Updating…" : "🧹 Mark as Housekeeping"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

// ─── ROOM MODAL (create / edit) ───────────────────────────────────────────────

function RoomModal({ mode, initial, onClose, onSubmit, saving }: {
  mode:     "create" | "edit";
  initial:  CreateRoomPayload;
  onClose:  () => void;
  onSubmit: (data: CreateRoomPayload) => Promise<void>;
  saving:   boolean;
}) {
  const [form, setForm] = useState<CreateRoomPayload>(initial);

  function set<K extends keyof CreateRoomPayload>(key: K, val: CreateRoomPayload[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b",
    background: "#f8fafc", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em",
    textTransform: "uppercase", marginBottom: 5, display: "block",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 540, padding: "32px 30px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {mode === "create" ? "Add New Room" : "Edit Room"}
          </h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>
          <div>
            <label style={labelStyle}>Room Number</label>
            <input style={inputStyle} value={form.room_number} onChange={(e) => set("room_number", e.target.value)} placeholder="#001" />
          </div>
          <div>
            <label style={labelStyle}>Floor</label>
            <input style={inputStyle} type="number" min={1} value={form.floor} onChange={(e) => set("floor", Number(e.target.value))} />
          </div>
          <div>
            <label style={labelStyle}>Type</label>
            <select style={inputStyle} value={form.type} onChange={(e) => set("type", e.target.value)}>
              {TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Price / Night (₱)</label>
            <input style={inputStyle} type="number" min={0} value={form.price_per_night} onChange={(e) => set("price_per_night", e.target.value)} placeholder="1000.00" />
          </div>
          <div>
            <label style={labelStyle}>Max Occupancy</label>
            <input style={inputStyle} type="number" min={1} value={form.max_occupancy} onChange={(e) => set("max_occupancy", Number(e.target.value))} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Room Image</label>
            <ImageUploader value={form.image_url ?? ""} onChange={(url) => set("image_url", url)} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Description</label>
            <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 72 }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Room description..." />
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={() => onSubmit(form)} disabled={saving}
            style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: saving ? "#94a3b8" : "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving…" : mode === "create" ? "Create Room" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM ──────────────────────────────────────────────────────────

function DeleteConfirm({ room, onClose, onConfirm, deleting }: {
  room:      Room;
  onClose:   () => void;
  onConfirm: () => Promise<void>;
  deleting:  boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, padding: "32px 30px", boxShadow: "0 24px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff1f2", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🗑️</div>
        <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Delete Room {room.room_number}?</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#94a3b8" }}>This action cannot be undone.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting}
            style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: deleting ? "#fda4af" : "#f43f5e", color: "#fff", fontSize: 13, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function RoomPage() {
  const [activeTab, setActiveTab] = useState<"occupancy" | "manage">("occupancy");

  const [occupancyRooms,   setOccupancyRooms]   = useState<OccupancyRoom[]>([]);
  const [summary,          setSummary]           = useState<OccupancySummary | null>(null);
  const [occupancyLoading, setOccupancyLoading]  = useState(true);
  const [occupancyError,   setOccupancyError]    = useState<string | null>(null);
  const [selectedRoom,     setSelectedRoom]      = useState<OccupancyRoom | null>(null);
  const [filterOccStatus,  setFilterOccStatus]   = useState("All");

  const [rooms,        setRooms]         = useState<Room[]>([]);
  const [manageLoading,setManageLoading] = useState(true);
  const [manageError,  setManageError]   = useState<string | null>(null);
  const [search,       setSearch]        = useState("");
  const [filterType,   setFilterType]    = useState("All");
  const [showCreate,   setShowCreate]    = useState(false);
  const [editTarget,   setEditTarget]    = useState<Room | null>(null);
  const [deleteTarget, setDeleteTarget]  = useState<Room | null>(null);
  const [saving,       setSaving]        = useState(false);
  const [deleting,     setDeleting]      = useState(false);

  const toast = useToast();

  async function loadOccupancy() {
    setOccupancyLoading(true); setOccupancyError(null);
    try {
      const res = await fetch(`${API_BASE_URL}rooms/occupancy/today/`, { cache: "no-store" });
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      setOccupancyRooms(data.rooms);
      setSummary(data.summary);
    } catch (e: any) { setOccupancyError(e.message); }
    finally { setOccupancyLoading(false); }
  }

  async function loadRooms() {
    setManageLoading(true); setManageError(null);
    try { setRooms(await getRooms()); }
    catch (e: any) { setManageError(e.message); }
    finally { setManageLoading(false); }
  }

  useEffect(() => { loadOccupancy(); loadRooms(); }, []);

  async function handleStatusUpdate(roomId: number, newStatus: string) {
    try {
      const res = await fetch(`${API_BASE_URL}rooms/${roomId}/room-status/`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update");
      toast.success(`Room status updated to ${newStatus}`);
      await loadOccupancy();
    } catch (e: any) { toast.error(e.message); }
  }

  async function handleCreate(data: CreateRoomPayload) {
    setSaving(true);
    try {
      const created = await createRoom(data);
      setRooms((r) => [...r, created]);
      setShowCreate(false);
      toast.success("Room created successfully.");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleUpdate(data: CreateRoomPayload) {
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await updateRoom(editTarget.room_id, data as UpdateRoomPayload);
      setRooms((r) => r.map((x) => (x.room_id === updated.room_id ? updated : x)));
      setEditTarget(null);
      toast.success("Room updated successfully.");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteRoom(deleteTarget.room_id);
      setRooms((r) => r.filter((x) => x.room_id !== deleteTarget.room_id));
      setDeleteTarget(null);
      toast.success("Room deleted.");
    } catch (e: any) { toast.error(e.message); }
    finally { setDeleting(false); }
  }

  const filteredOccupancy = occupancyRooms.filter((r) =>
    filterOccStatus === "All" || r.room_status === filterOccStatus
  );

  const filteredManage = rooms.filter((r) => {
    const matchSearch = r.room_number.toLowerCase().includes(search.toLowerCase()) || r.type.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterType === "All" || r.type === filterType);
  });

  // ── Summary — single row, 5 tiles ──
  const summaryRow = summary ? [
    { label: "Total Rooms",  value: summary.total_rooms,  color: "#0f172a", bg: "#f1f5f9", border: "#e2e8f0" },
    { label: "Occupied",     value: summary.occupied,     color: "#1d4ed8", bg: "#eff6ff", border: "#bfdbfe" },
    { label: "Vacant",       value: summary.vacant,       color: "#15803d", bg: "#f0fdf4", border: "#bbf7d0" },
    { label: "Pending",      value: summary.pending,      color: "#a16207", bg: "#fefce8", border: "#fde047" },
    { label: "Housekeeping", value: summary.housekeeping, color: "#7e22ce", bg: "#fdf4ff", border: "#e9d5ff" },
  ] : [];

  return (
    <>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>

      {selectedRoom  && <OccupancyModal room={selectedRoom} onClose={() => setSelectedRoom(null)} onStatusUpdate={handleStatusUpdate} />}
      {showCreate    && <RoomModal mode="create" initial={DEFAULT_FORM} onClose={() => setShowCreate(false)} onSubmit={handleCreate} saving={saving} />}
      {editTarget    && (
        <RoomModal
          mode="edit"
          initial={{ room_number: editTarget.room_number, floor: editTarget.floor, type: editTarget.type, price_per_night: editTarget.price_per_night, max_occupancy: editTarget.max_occupancy, image_url: editTarget.image_url ?? "", description: editTarget.description }}
          onClose={() => setEditTarget(null)}
          onSubmit={handleUpdate}
          saving={saving}
        />
      )}
      {deleteTarget  && <DeleteConfirm room={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} deleting={deleting} />}

      <div style={{ padding: "36px 40px", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: 0, letterSpacing: "-0.02em" }}>
              🏨 Room Management
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
              {summary
                ? new Date(summary.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
                : new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })
              }
            </p>
          </div>
          {activeTab === "manage" && (
            <button onClick={() => setShowCreate(true)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 22px", borderRadius: 12, border: "none", background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(15,23,42,0.25)" }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Room
            </button>
          )}
        </div>

        {/* ── Summary strip — single row ── */}
        {activeTab === "occupancy" && summary && (
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            {summaryRow.map(({ label, value, color, bg, border }) => (
              <div key={label} style={{ flex: 1, background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ fontSize: 28, fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.4 }}>{label}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 20, background: "#f1f5f9", borderRadius: 12, padding: 4, width: "fit-content" }}>
          {(["occupancy", "manage"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              style={{ padding: "8px 22px", borderRadius: 9, border: "none", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: activeTab === tab ? "#fff" : "transparent",
                color:      activeTab === tab ? "#0f172a" : "#94a3b8",
                boxShadow:  activeTab === tab ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
              }}>
              {tab === "occupancy" ? "🏨 Occupancy" : "⚙️ Manage Rooms"}
            </button>
          ))}
        </div>

        {/* ══ TAB 1: OCCUPANCY ══ */}
        {activeTab === "occupancy" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <select value={filterOccStatus} onChange={(e) => setFilterOccStatus(e.target.value)}
                style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                <option value="All">All Status</option>
                {OCC_STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
              <button onClick={loadOccupancy} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, cursor: "pointer" }}>🔄</button>
            </div>
            {occupancyError && (
              <div style={{ background: "#fff1f2", color: "#be123c", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>{occupancyError}</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {occupancyLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : filteredOccupancy.map((room) => (
                    <OccupancyCard key={room.room_id} room={room} onClick={() => setSelectedRoom(room)} />
                  ))
              }
            </div>
            {!occupancyLoading && filteredOccupancy.length === 0 && (
              <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 60, fontSize: 14 }}>No rooms match the selected filter.</div>
            )}
          </>
        )}

        {/* ══ TAB 2: MANAGE ══ */}
        {activeTab === "manage" && (
          <>
            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by room number or type…"
                style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit" }} />
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}
                style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer" }}>
                <option value="All">All Types</option>
                {TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
              <button onClick={loadRooms} style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, cursor: "pointer" }}>🔄</button>
            </div>
            {manageError && (
              <div style={{ background: "#fff1f2", color: "#be123c", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13 }}>{manageError}</div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
              {manageLoading
                ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
                : filteredManage.map((room) => (
                    <ManageCard key={room.room_id} room={room} onEdit={() => setEditTarget(room)} onDelete={() => setDeleteTarget(room)} />
                  ))
              }
            </div>
            {!manageLoading && filteredManage.length === 0 && (
              <div style={{ textAlign: "center", color: "#94a3b8", marginTop: 60, fontSize: 14 }}>
                {search || filterType !== "All" ? "No rooms match your search." : "No rooms found."}
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
}