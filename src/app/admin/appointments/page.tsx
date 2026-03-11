"use client";

import { useEffect, useState } from "react";
import { Appointment, CreateAppointmentPayload, UpdateAppointmentPayload } from "@/types/appointments";
import { Booking } from "@/types/bookings";
import { Guest } from "@/types/guests";
import { Room } from "@/types/room";
import { User } from "@/types/user";
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from "@/services/appointmentServices";
import { getBookings } from "@/services/bookingService";
import { getGuests } from "@/services/guestService";
import { getRooms } from "@/services/roomService";
import { getUsers } from "@/services/userService";
import { useToast } from "@/hooks/useToast";

// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const STATUSES = ["Pending", "Confirmed", "Cancelled", "Completed"] as const;
type AppointmentStatus = (typeof STATUSES)[number];

// Accommodation types — auto-created or manually by staff for check-in
const ACCOMMODATION_TYPES = ["Check-in", "Check-out"] as const;

// Service types — manually created by staff
const SERVICE_TYPES = ["Spa Session", "Dining", "Housekeeping", "Laundry", "Maintenance", "Transportation", "Other"] as const;

const ALL_SERVICE_TYPES = [...ACCOMMODATION_TYPES, ...SERVICE_TYPES] as const;

const STATUS_STYLE: Record<AppointmentStatus, { bg: string; color: string; dot: string }> = {
  Pending:   { bg: "#fefce8", color: "#a16207",  dot: "#eab308" },
  Confirmed: { bg: "#f0fdf4", color: "#15803d",  dot: "#22c55e" },
  Cancelled: { bg: "#fff1f2", color: "#be123c",  dot: "#f43f5e" },
  Completed: { bg: "#eff6ff", color: "#1d4ed8",  dot: "#3b82f6" },
};

const SERVICE_TYPE_STYLE: Record<string, { bg: string; color: string }> = {
  "Check-in":      { bg: "#f0fdf4", color: "#15803d" },
  "Check-out":     { bg: "#eff6ff", color: "#1d4ed8" },
  "Spa Session":   { bg: "#fdf4ff", color: "#7e22ce" },
  "Dining":        { bg: "#fff7ed", color: "#c2410c" },
  "Housekeeping":  { bg: "#f0f9ff", color: "#0369a1" },
  "Laundry":       { bg: "#f0fdf4", color: "#166534" },
  "Maintenance":   { bg: "#fef9c3", color: "#854d0e" },
  "Transportation":{ bg: "#f1f5f9", color: "#334155" },
  "Other":         { bg: "#f3f4f6", color: "#374151" },
};

const DEFAULT_FORM: CreateAppointmentPayload = {
  guest:          0,
  booking:        0,
  service_type:   "Check-in",
  room:           0,
  scheduled_at:   "",
  status:         "Completed",
  assigned_staff: null,
  notes:          "",
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDateTime(dt: string) {
  return new Date(dt).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit", hour12: true,
  });
}

function toDateTimeLocal(dt: string) {
  if (!dt) return "";
  const d = new Date(dt);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ─── BADGES ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status as AppointmentStatus] ?? { bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" };
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}

function ServiceTypeBadge({ type }: { type: string }) {
  const s = SERVICE_TYPE_STYLE[type] ?? { bg: "#f3f4f6", color: "#374151" };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: s.bg, color: s.color }}>
      {type}
    </span>
  );
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[40, 120, 80, 80, 80, 140, 100, 80, 60].map((w, i) => (
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
  initial:  CreateAppointmentPayload;
  guests:   Guest[];
  bookings: Booking[];
  rooms:    Room[];
  staff:    User[];
  onClose:  () => void;
  onSubmit: (data: CreateAppointmentPayload) => Promise<void>;
  saving:   boolean;
}

function AppointmentModal({ mode, initial, guests, bookings, rooms, staff, onClose, onSubmit, saving }: ModalProps) {
  const [form, setForm] = useState<CreateAppointmentPayload>(initial);

  function set<K extends keyof CreateAppointmentPayload>(key: K, val: CreateAppointmentPayload[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  useEffect(() => {
  if (form.service_type === "Check-in" || form.service_type === "Check-out") {
    setForm((f) => ({ ...f, status: "Completed" }))
  }
}, [form.service_type])

  // Auto-fill guest and room when booking is selected
  function handleBookingChange(bookingId: number) {
    const selected = bookings.find((b) => b.booking_id === bookingId);
    if (selected) {
      setForm((f) => ({
        ...f,
        booking: bookingId,
        guest:   selected.guest,
        room:    selected.room,
      }));
    } else {
      set("booking", bookingId);
    }
  }

  const isAccommodation = ACCOMMODATION_TYPES.includes(form.service_type as any);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 10,
    border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b",
    background: "#f8fafc", outline: "none", boxSizing: "border-box",
    fontFamily: "inherit",
  };

  const readOnlyStyle: React.CSSProperties = {
    ...inputStyle,
    background: "#f1f5f9",
    color: "#94a3b8",
    cursor: "not-allowed",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#94a3b8",
    letterSpacing: "0.06em", textTransform: "uppercase",
    marginBottom: 5, display: "block",
  };

  const sectionHeaderStyle = (color: string, bg: string): React.CSSProperties => ({
    fontSize: 11, fontWeight: 800, color, letterSpacing: "0.08em",
    textTransform: "uppercase", padding: "8px 12px", borderRadius: 8,
    background: bg, marginBottom: 16, display: "flex", alignItems: "center", gap: 6,
  });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 560, padding: "32px 30px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {mode === "create" ? "New Appointment" : "Edit Appointment"}
          </h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        {/* ── SECTION 1: ACCOMMODATION ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sectionHeaderStyle("#1d4ed8", "#eff6ff")}>
            🏨 Accommodation
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>

            {/* Service Type — accommodation only */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Type</label>
              <div style={{ display: "flex", gap: 8 }}>
                {ACCOMMODATION_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => set("service_type", t)}
                    style={{
                      flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 13,
                      fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      border: form.service_type === t ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                      background: form.service_type === t ? "#eff6ff" : "#f8fafc",
                      color: form.service_type === t ? "#1d4ed8" : "#94a3b8",
                      transition: "all 0.15s",
                    }}
                  >
                    {t === "Check-in" ? "🔑 Check-in" : "🚪 Check-out"}
                  </button>
                ))}
              </div>
            </div>

            {/* Booking — auto-fills guest and room */}
            {isAccommodation && (
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Booking</label>
                <select
                  style={inputStyle}
                  value={form.booking || ""}
                  onChange={(e) => handleBookingChange(Number(e.target.value))}
                >
                  <option value="">Select booking…</option>
                  {bookings.map((b) => (
                    <option key={b.booking_id} value={b.booking_id}>
                      #{b.booking_id} — {b.check_in_date} → {b.check_out_date}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Guest — read-only when accommodation (auto-filled) */}
            {isAccommodation && (
              <div>
                <label style={labelStyle}>Guest <span style={{ color: "#3b82f6", fontSize: 9 }}>AUTO</span></label>
                <select style={readOnlyStyle} value={form.guest || ""} disabled>
                  <option value="">Auto-filled from booking</option>
                  {guests.map((g) => (
                    <option key={g.guest_id} value={g.guest_id}>{g.full_name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Room — read-only when accommodation (auto-filled) */}
            {isAccommodation && (
              <div>
                <label style={labelStyle}>Room <span style={{ color: "#3b82f6", fontSize: 9 }}>AUTO</span></label>
                <select style={readOnlyStyle} value={form.room || ""} disabled>
                  <option value="">Auto-filled from booking</option>
                  {rooms.map((r) => (
                    <option key={r.room_id} value={r.room_id}>{r.room_number} — {r.type}</option>
                  ))}
                </select>
              </div>
            )}

          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "#f1f5f9", margin: "0 0 24px" }} />

        {/* ── SECTION 2: SERVICES ── */}
        <div style={{ marginBottom: 24 }}>
          <div style={sectionHeaderStyle("#c2410c", "#fff7ed")}>
            🛎️ Services
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>

            {/* Service Type — services only */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Service Type</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {SERVICE_TYPES.map((t) => (
                  <button
                    key={t}
                    onClick={() => set("service_type", t)}
                    style={{
                      padding: "6px 14px", borderRadius: 99, fontSize: 12,
                      fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                      border: form.service_type === t ? "2px solid #ea580c" : "1px solid #e2e8f0",
                      background: form.service_type === t ? "#fff7ed" : "#f8fafc",
                      color: form.service_type === t ? "#c2410c" : "#94a3b8",
                      transition: "all 0.15s",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Guest — editable for services */}
            {!isAccommodation && (
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
            )}

            {/* Booking — editable for services */}
            {!isAccommodation && (
              <div>
                <label style={labelStyle}>Booking</label>
                <select
                  style={inputStyle}
                  value={form.booking || ""}
                  onChange={(e) => handleBookingChange(Number(e.target.value))}
                >
                  <option value="">Select booking…</option>
                  {bookings.map((b) => (
                    <option key={b.booking_id} value={b.booking_id}>
                      #{b.booking_id} — {b.check_in_date}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Room */}
            {!isAccommodation && (
              <div>
                <label style={labelStyle}>Room <span style={{ color: "#3b82f6", fontSize: 9 }}>AUTO</span></label>
                <select
                  style={form.booking ? readOnlyStyle : inputStyle}
                  value={form.room || ""}
                  disabled={!!form.booking}
                  onChange={(e) => set("room", Number(e.target.value))}
                >
                  <option value="">Select room…</option>
                  {rooms.map((r) => (
                    <option key={r.room_id} value={r.room_id}>{r.room_number} — {r.type}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Scheduled At */}
            <div style={{ gridColumn: isAccommodation ? "1 / -1" : "auto" }}>
              <label style={labelStyle}>Scheduled At</label>
              <input
                style={inputStyle}
                type="datetime-local"
                value={toDateTimeLocal(form.scheduled_at)}
                onChange={(e) => set("scheduled_at", new Date(e.target.value).toISOString())}
              />
            </div>

            {/* Status */}
            {!isAccommodation && (
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
            )}

            {/* Assigned Staff */}
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Assigned Staff</label>
              <select
                style={inputStyle}
                value={form.assigned_staff ?? ""}
                onChange={(e) => set("assigned_staff", e.target.value ? Number(e.target.value) : null)}
              >
                <option value="">Unassigned</option>
                {staff.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
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
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
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
            {saving ? "Saving…" : mode === "create" ? "Create Appointment" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM ──────────────────────────────────────────────────────────

function DeleteConfirm({ appointment, onClose, onConfirm, deleting }: {
  appointment: Appointment;
  onClose:     () => void;
  onConfirm:   () => Promise<void>;
  deleting:    boolean;
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
          Delete Appointment #{appointment.appointment_id}?
        </h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#94a3b8" }}>
          This action cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: deleting ? "#fda4af" : "#f43f5e", color: "#fff", fontSize: 13, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function AppointmentPage() {
  const [appointments,   setAppointments]   = useState<Appointment[]>([]);
  const [guests,         setGuests]         = useState<Guest[]>([]);
  const [bookings,       setBookings]       = useState<Booking[]>([]);
  const [rooms,          setRooms]          = useState<Room[]>([]);
  const [staff,          setStaff]          = useState<User[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [error,          setError]          = useState<string | null>(null);
  const [search,         setSearch]         = useState("");
  const [filterStatus,   setFilterStatus]   = useState("All");
  const [filterService,  setFilterService]  = useState("All");
  const [showCreate,     setShowCreate]     = useState(false);
  const [editTarget,     setEditTarget]     = useState<Appointment | null>(null);
  const [deleteTarget,   setDeleteTarget]   = useState<Appointment | null>(null);
  const [saving,         setSaving]         = useState(false);
  const [deleting,       setDeleting]       = useState(false);

  const toast = useToast();

  function guestName(id: number)        { return guests.find((g)  => g.guest_id      === id)?.full_name   ?? `Guest #${id}`; }
  function roomNumber(id: number)       { return rooms.find((r)   => r.room_id       === id)?.room_number ?? `Room #${id}`; }
  function staffName(id: number | null) { return id ? (staff.find((u) => u.id === id)?.name ?? `Staff #${id}`) : "Unassigned"; }
  function bookingLabel(id: number)     {
    const b = bookings.find((b) => b.booking_id === id);
    return b ? `#${b.booking_id}` : `#${id}`;
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [a, g, b, r, u] = await Promise.all([
        getAppointments(), getGuests(), getBookings(), getRooms(), getUsers(),
      ]);
      setAppointments(a);
      setGuests(g);
      setBookings(b);
      setRooms(r);
      setStaff(u);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(data: CreateAppointmentPayload) {
    if (!data.scheduled_at) { toast.error("Please select a scheduled date and time."); return; }
    if (!data.guest)        { toast.error("Please select a guest."); return; }
    if (!data.booking)      { toast.error("Please select a booking."); return; }
    if (!data.room)         { toast.error("Please select a room."); return; }
    setSaving(true);
    try {
      const created = await createAppointment(data);
      setAppointments((a) => [...a, created]);
      setShowCreate(false);
      toast.success("Appointment created successfully.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: CreateAppointmentPayload) {
    if (!editTarget) return;
    if (!data.scheduled_at) { toast.error("Please select a scheduled date and time."); return; }
    if (!data.guest)        { toast.error("Please select a guest."); return; }
    if (!data.booking)      { toast.error("Please select a booking."); return; }
    if (!data.room)         { toast.error("Please select a room."); return; }
    setSaving(true);
    try {
      const updated = await updateAppointment(editTarget.appointment_id, data as UpdateAppointmentPayload);
      setAppointments((a) => a.map((x) => (x.appointment_id === updated.appointment_id ? updated : x)));
      setEditTarget(null);
      toast.success("Appointment updated successfully.");
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
      await deleteAppointment(deleteTarget.appointment_id);
      setAppointments((a) => a.filter((x) => x.appointment_id !== deleteTarget.appointment_id));
      setDeleteTarget(null);
      toast.success("Appointment deleted.");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  }

  const stats = STATUSES.map((s) => ({
    label: s,
    count: appointments.filter((a) => a.status === s).length,
  }));

  const filtered = appointments.filter((a) => {
    const matchSearch =
      String(a.appointment_id).includes(search) ||
      guestName(a.guest).toLowerCase().includes(search.toLowerCase()) ||
      roomNumber(a.room).toLowerCase().includes(search.toLowerCase()) ||
      a.service_type.toLowerCase().includes(search.toLowerCase()) ||
      a.notes?.toLowerCase().includes(search.toLowerCase());
    const matchStatus  = filterStatus  === "All" || a.status       === filterStatus;
    const matchService = filterService === "All" || a.service_type === filterService;
    return matchSearch && matchStatus && matchService;
  });

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
        <AppointmentModal
          mode="create" initial={DEFAULT_FORM}
          guests={guests} bookings={bookings} rooms={rooms} staff={staff}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
          saving={saving}
        />
      )}
      {editTarget && (
        <AppointmentModal
          mode="edit"
          initial={{
            guest:          editTarget.guest,
            booking:        editTarget.booking,
            service_type:   editTarget.service_type,
            room:           editTarget.room,
            scheduled_at:   editTarget.scheduled_at,
            status:         editTarget.status,
            assigned_staff: editTarget.assigned_staff,
            notes:          editTarget.notes,
          }}
          guests={guests} bookings={bookings} rooms={rooms} staff={staff}
          onClose={() => setEditTarget(null)}
          onSubmit={handleUpdate}
          saving={saving}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          appointment={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          deleting={deleting}
        />
      )}

      <div style={{ padding: "36px 40px", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Appointments</h1>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
              Welcome back, Admin ·{" "}
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "none", background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(15,23,42,0.2)" }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Appointment
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
          {stats.map(({ label, count }) => {
            const s = STATUS_STYLE[label as AppointmentStatus];
            return (
              <div key={label} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{count}</div>
              </div>
            );
          })}
        </div>

        {/* Search & Filters */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, guest, room, service, or notes…"
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
          <select
            value={filterService}
            onChange={(e) => setFilterService(e.target.value)}
            style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer" }}
          >
            <option value="All">All Services</option>
            {ALL_SERVICE_TYPES.map((s) => <option key={s}>{s}</option>)}
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
                  {["ID", "Guest", "Booking", "Service", "Room", "Scheduled", "Status", "Staff", "Notes", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((a) => (
                      <tr key={a.appointment_id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>#{a.appointment_id}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{guestName(a.guest)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569" }}>{bookingLabel(a.booking)}</td>
                        <td style={{ padding: "14px 16px" }}><ServiceTypeBadge type={a.service_type} /></td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{roomNumber(a.room)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#475569", whiteSpace: "nowrap" }}>{formatDateTime(a.scheduled_at)}</td>
                        <td style={{ padding: "14px 16px" }}><StatusBadge status={a.status} /></td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{staffName(a.assigned_staff)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8", maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.notes || "—"}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => setEditTarget(a)}
                              title="Edit"
                              style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(a)}
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

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "48px 0", fontSize: 14 }}>
              {search || filterStatus !== "All" || filterService !== "All"
                ? "No appointments match your search."
                : "No appointments found."}
            </div>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8" }}>
              Showing {filtered.length} of {appointments.length} appointment{appointments.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </>
  );
}