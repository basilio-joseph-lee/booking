"use client";

import { useEffect, useState } from "react";
import { Booking, CreateBookingPayload, UpdateBookingPayload } from "@/types/bookings";
import { Room } from "@/types/room";
import { Guest } from "@/types/guests";
import {
  getBookings,
  createBooking,
  updateBooking,
  deleteBooking,
} from "@/services/bookingService";
import { getRooms } from "@/services/roomService";
import { getGuests } from "@/services/guestService";
import { useToast } from "@/hooks/useToast";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const STATUSES = ["Pending", "Confirmed", "Cancelled", "Completed"] as const;
type BookingStatus = (typeof STATUSES)[number];

const STATUS_STYLE: Record<BookingStatus, { bg: string; color: string; dot: string }> = {
  Pending:   { bg: "#fefce8", color: "#a16207", dot: "#eab308" },
  Confirmed: { bg: "#f0fdf4", color: "#15803d", dot: "#22c55e" },
  Cancelled: { bg: "#fff1f2", color: "#be123c", dot: "#f43f5e" },
  Completed: { bg: "#eff6ff", color: "#1d4ed8", dot: "#3b82f6" },
};

const DEFAULT_FORM: CreateBookingPayload = {
  guest:          0,
  room:           0,
  check_in_date:  "",
  check_out_date: "",
  status:         "Pending",
  room_status:    "Available",  // ← added
  total_amount:   "",
  notes:          "",
  created_by:     null,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function nightsBetween(checkIn: string, checkOut: string) {
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

// ─── BADGE ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status as BookingStatus] ?? {
    bg: "#f3f4f6", color: "#374151", dot: "#9ca3af",
  };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color, letterSpacing: "0.03em" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot, flexShrink: 0 }} />
      {status}
    </span>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[40, 120, 80, 100, 100, 50, 80, 70, 100, 60].map((w, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{ height: 12, width: w, borderRadius: 6, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.05}s` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────

interface ModalProps {
  mode:     "create" | "edit";
  initial:  CreateBookingPayload;
  guests:   Guest[];
  rooms:    Room[];
  onClose:  () => void;
  onSubmit: (data: CreateBookingPayload) => Promise<void>;
  saving:   boolean;
}

function BookingModal({ mode, initial, guests, rooms, onClose, onSubmit, saving }: ModalProps) {
  const [form, setForm] = useState<CreateBookingPayload>(initial);

  function set<K extends keyof CreateBookingPayload>(key: K, val: CreateBookingPayload[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  // ── Auto-suggest total_amount ──
  const selectedRoom = rooms.find((r) => r.room_id === form.room);
  const nights =
    form.check_in_date && form.check_out_date
      ? Math.max(0, Math.round(
          (new Date(form.check_out_date).getTime() - new Date(form.check_in_date).getTime())
          / (1000 * 60 * 60 * 24)
        ))
      : 0;
  const suggestedAmount =
    selectedRoom && nights > 0
      ? (parseFloat(String(selectedRoom.price_per_night)) * nights).toFixed(2)
      : "";

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
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, padding: "32px 30px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {mode === "create" ? "New Booking" : "Edit Booking"}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}
          >✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>

          {/* Guest */}
          <div>
            <label style={labelStyle}>Guest</label>
            <select
              style={inputStyle}
              value={form.guest || ""}
              onChange={(e) => set("guest", Number(e.target.value))}
            >
              <option value="">Select guest…</option>
              {guests.map((g) => (
                <option key={g.guest_id} value={g.guest_id}>{g.full_name}</option>
              ))}
            </select>
          </div>

          {/* Room */}
          <div>
            <label style={labelStyle}>Room</label>
            <select
              style={inputStyle}
              value={form.room || ""}
              onChange={(e) => set("room", Number(e.target.value))}
            >
              <option value="">Select room…</option>
              {rooms.map((r) => (
                <option key={r.room_id} value={r.room_id}>
                  {r.room_number} — {r.type} (Floor {r.floor})
                </option>
              ))}
            </select>
          </div>

          {/* Check-in */}
          <div>
            <label style={labelStyle}>Check-in Date</label>
            <input
              style={inputStyle}
              type="date"
              value={form.check_in_date}
              onChange={(e) => set("check_in_date", e.target.value)}
            />
          </div>

          {/* Check-out */}
          <div>
            <label style={labelStyle}>Check-out Date</label>
            <input
              style={inputStyle}
              type="date"
              value={form.check_out_date}
              onChange={(e) => set("check_out_date", e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <label style={labelStyle}>Status</label>
            <select
              style={inputStyle}
              value={form.status}
              onChange={(e) => set("status", e.target.value)}
            >
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Total Amount — auto-suggest with override */}
          <div>
            <label style={{ ...labelStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>Total Amount (₱)</span>
              {suggestedAmount && form.total_amount !== suggestedAmount && (
                <span
                  onClick={() => set("total_amount", suggestedAmount)}
                  style={{ fontSize: 10, color: "#3b82f6", cursor: "pointer", fontWeight: 700, textTransform: "none", letterSpacing: 0 }}
                >
                  Use ₱{parseFloat(suggestedAmount).toLocaleString()}
                </span>
              )}
            </label>
            <input
              style={{
                ...inputStyle,
                borderColor: suggestedAmount && form.total_amount !== suggestedAmount
                  ? "#bfdbfe" : "#e2e8f0",
                background: suggestedAmount && form.total_amount !== suggestedAmount
                  ? "#eff6ff" : "#f8fafc",
              }}
              type="number"
              min={0}
              value={form.total_amount}
              onChange={(e) => set("total_amount", e.target.value)}
              placeholder={suggestedAmount ? `Suggested: ${suggestedAmount}` : "0.00"}
            />
            {suggestedAmount && nights > 0 && (
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                {nights} night{nights !== 1 ? "s" : ""} × ₱{parseFloat(String(selectedRoom?.price_per_night || 0)).toLocaleString()} / night
              </div>
            )}
          </div>

          {/* Notes */}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Notes</label>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Optional notes…"
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button
            onClick={onClose}
            style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={saving}
            style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: saving ? "#94a3b8" : "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {saving ? "Saving…" : mode === "create" ? "Create Booking" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM ──────────────────────────────────────────────────────────

function DeleteConfirm({ booking, onClose, onConfirm, deleting }: {
  booking:   Booking;
  onClose:   () => void;
  onConfirm: () => Promise<void>;
  deleting:  boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, padding: "32px 30px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff1f2", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/>
            <path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
          Delete Booking #{booking.booking_id}?
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#94a3b8" }}>
          This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={onClose}
            style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}
          >Cancel</button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: deleting ? "#fda4af" : "#f43f5e", color: "#fff", fontSize: 13, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function BookingPage() {
  const [bookings,      setBookings]      = useState<Booking[]>([]);
  const [guests,        setGuests]        = useState<Guest[]>([]);
  const [rooms,         setRooms]         = useState<Room[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [search,        setSearch]        = useState("");
  const [filterStatus,  setFilterStatus]  = useState("All");
  const [showCreate,    setShowCreate]    = useState(false);
  const [editTarget,    setEditTarget]    = useState<Booking | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<Booking | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  const toast = useToast();

  function guestName(id: number) {
    return guests.find((g) => g.guest_id === id)?.full_name ?? `Guest #${id}`;
  }
  function roomNumber(id: number) {
    return rooms.find((r) => r.room_id === id)?.room_number ?? `Room #${id}`;
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [b, g, r] = await Promise.all([getBookings(), getGuests(), getRooms()]);
      setBookings(b);
      setGuests(g);
      setRooms(r);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(data: CreateBookingPayload) {
    setSaving(true);
    try {
      const created = await createBooking(data);
      setBookings((b) => [...b, created]);
      setShowCreate(false);
      toast.success("Booking created successfully.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: CreateBookingPayload) {
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await updateBooking(editTarget.booking_id, data as UpdateBookingPayload);
      setBookings((b) => b.map((x) => (x.booking_id === updated.booking_id ? updated : x)));
      setEditTarget(null);
      toast.success("Booking updated successfully.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBooking(deleteTarget.booking_id);
      setBookings((b) => b.filter((x) => x.booking_id !== deleteTarget.booking_id));
      setDeleteTarget(null);
      toast.success("Booking deleted.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const filtered = bookings.filter((b) => {
    const gName = guestName(b.guest).toLowerCase();
    const rNum  = roomNumber(b.room).toLowerCase();
    const matchSearch =
      String(b.booking_id).includes(search) ||
      gName.includes(search.toLowerCase()) ||
      rNum.includes(search.toLowerCase()) ||
      b.notes?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = STATUSES.map((s) => ({
    label: s,
    count: bookings.filter((b) => b.status === s).length,
  }));

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        table { border-collapse: collapse; width: 100%; }
        thead th { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
        tbody tr:hover td { background: #f8fafc; }
      `}</style>

      {/* Modals */}
      {showCreate && (
        <BookingModal
          mode="create"
          initial={DEFAULT_FORM}
          guests={guests}
          rooms={rooms}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          saving={saving}
        />
      )}
      {editTarget && (
        <BookingModal
          mode="edit"
          initial={{
            guest:          editTarget.guest,
            room:           editTarget.room,
            check_in_date:  editTarget.check_in_date,
            check_out_date: editTarget.check_out_date,
            status:         editTarget.status,
            room_status:    editTarget.room_status,   // ← added
            total_amount:   editTarget.total_amount,
            notes:          editTarget.notes,
            created_by:     editTarget.created_by,
          }}
          guests={guests}
          rooms={rooms}
          onClose={() => setEditTarget(null)}
          onSubmit={handleUpdate}
          saving={saving}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          booking={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      <div style={{ padding: "36px 40px", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Bookings</h1>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
              Welcome back, Admin ·{" "}
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "none", background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(15,23,42,0.2)" }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Booking
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {stats.map(({ label, count }) => {
            const s = STATUS_STYLE[label as BookingStatus];
            return (
              <div key={label} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{count}</div>
              </div>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, guest name, room number, or notes…"
            style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit" }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer" }}
          >
            <option value="All">All Status</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <button
            onClick={load}
            title="Refresh"
            style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, cursor: "pointer" }}
          >🔄</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fff1f2", color: "#be123c", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, fontWeight: 500 }}>
            Failed to load: {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {["ID", "Guest", "Room", "Check-in", "Check-out", "Nights", "Amount", "Status", "Room Status", "Notes", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((b) => (
                      <tr key={b.booking_id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>#{b.booking_id}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{guestName(b.guest)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{roomNumber(b.room)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{formatDate(b.check_in_date)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{formatDate(b.check_out_date)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{nightsBetween(b.check_in_date, b.check_out_date)}n</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#0f172a", whiteSpace: "nowrap" }}>₱{parseFloat(b.total_amount).toLocaleString()}</td>
                        <td style={{ padding: "14px 16px" }}><StatusBadge status={b.status} /></td>
                        <td style={{ padding: "14px 16px" }}><StatusBadge status={b.room_status} /></td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.notes || "—"}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => setEditTarget(b)}
                              title="Edit"
                              style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(b)}
                              title="Delete"
                              style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #fecdd3", background: "#fff1f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                                <path d="M10 11v6"/><path d="M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "48px 0", fontSize: 14 }}>
              {search || filterStatus !== "All" ? "No bookings match your search." : "No bookings found."}
            </div>
          )}

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8" }}>
              Showing {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </>
  );
}