"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthUser, logout } from "@/services/authServices";
import { API_BASE_URL } from "@/config/api";

// ── Types ──────────────────────────────────────────────
interface AuthUser { 
  id: number; name: string; email: string; role: string; avatar_url: string | null; }

interface Booking {
  booking_id:     number;
  room:           number;
  room_number?:   string;
  room_type?:     string;
  check_in_date:  string;
  check_out_date: string;
  status:         string;
  room_status:    string;
  total_amount:   string;
  notes:          string;
  created_at:     string;
}

interface Room {
  room_id:         number;
  room_number:     string;
  type:            string;
  price_per_night: string;
  floor:           number;
}

interface Transaction {
  transaction_id:   number;
  category:         string;
  amount:           string;
  description:      string;
  transaction_date: string;
  booking:          number | null;
}

interface PaymentForm {
  card_name:   string;
  card_number: string;
  expiry:      string;
  cvv:         string;
}

// ── Helpers ────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function peso(n: string | number) {
  return `₱${parseFloat(String(n)).toLocaleString("en-PH", { minimumFractionDigits: 2 })}`;
}
function nightsBetween(a: string, b: string) {
  return Math.max(0, Math.floor((new Date(b).getTime() - new Date(a).getTime()) / 86400000));
}
function formatCardNumber(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}
function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

const STATUS_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  Confirmed: { bg: "rgba(34,197,94,0.08)",  color: "#4ade80", border: "rgba(34,197,94,0.25)"  },
  Pending:   { bg: "rgba(234,179,8,0.08)",  color: "#fbbf24", border: "rgba(234,179,8,0.25)"  },
  Cancelled: { bg: "rgba(239,68,68,0.08)",  color: "#f87171", border: "rgba(239,68,68,0.25)"  },
  Completed: { bg: "rgba(99,102,241,0.08)", color: "#a5b4fc", border: "rgba(99,102,241,0.25)" },
};

// ── Shared styles ──────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0c0a09; color: #f5f0e8; font-family: 'Jost', sans-serif; }
  ::selection { background: #c9a84c33; color: #c9a84c; }
  body::before {
    content: ''; position: fixed; inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none; z-index: 9999; opacity: 0.35;
  }
  @keyframes fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes slideUp  { from { opacity:0; transform:translateY(32px); } to { opacity:1; transform:translateY(0); } }
  @keyframes spin     { to { transform: rotate(360deg); } }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.4} }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0c0a09; }
  ::-webkit-scrollbar-thumb { background: #c9a84c44; border-radius: 2px; }
  .luxury-input:focus { border-color: #c9a84c !important; }
`;

// ══════════════════════════════════════════════════════
//  PAYMENT MODAL
// ══════════════════════════════════════════════════════
function PaymentModal({
  booking,
  room,
  onClose,
  onSuccess,
}: {
  booking:   Booking;
  room:      Room | null;
  onClose:   () => void;
  onSuccess: (bookingId: number) => void;
}) {
  const [form, setForm] = useState<PaymentForm>({
    card_name: "", card_number: "", expiry: "", cvv: "",
  });
  const [processing, setProcessing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [step,       setStep]       = useState<"form" | "success">("form");

  const nights = nightsBetween(booking.check_in_date, booking.check_out_date);

  function setField<K extends keyof PaymentForm>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  // ── STRIPE INTEGRATION POINT ──────────────────────────
  // When integrating Stripe later, replace this function body with:
  //   const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, { ... })
  //   if (error) throw new Error(error.message)
  //   then PATCH status to Confirmed after successful paymentIntent
  async function processPayment() {
    if (!form.card_name || !form.card_number || !form.expiry || !form.cvv) {
      setError("Please fill in all card details."); return;
    }
    if (form.card_number.replace(/\s/g, "").length < 16) {
      setError("Please enter a valid 16-digit card number."); return;
    }
    if (form.cvv.length < 3) {
      setError("Please enter a valid CVV."); return;
    }

    setProcessing(true); setError(null);

    try {
      // Placeholder: directly confirm booking
      // Replace this fetch with your Stripe payment call in the future
      const res = await fetch(`${API_BASE_URL}bookings/${booking.booking_id}/`, {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ status: "Confirmed" }),
      });
      if (!res.ok) throw new Error("Payment failed. Please try again.");
      setStep("success");
      setTimeout(() => {
        onSuccess(booking.booking_id);
        onClose();
      }, 2000);
    } catch (e: any) {
      setError(e.message);
      setProcessing(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(245,240,232,0.04)",
    border: "1px solid rgba(245,240,232,0.1)", color: "#f5f0e8",
    fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 300,
    padding: "13px 16px", outline: "none", transition: "border-color 0.3s",
    letterSpacing: "0.04em",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Jost'", fontSize: 9, fontWeight: 600,
    color: "rgba(245,240,232,0.35)", letterSpacing: "0.3em",
    textTransform: "uppercase", display: "block", marginBottom: 8,
  };

  return (
    // Overlay
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", animation: "fadeIn 0.2s ease",
      }}
    >
      {/* Modal */}
      <div style={{
        background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.25)",
        width: "100%", maxWidth: 520,
        animation: "slideUp 0.3s ease",
        maxHeight: "90vh", overflowY: "auto",
      }}>

        {/* Header */}
        <div style={{
          padding: "28px 32px 24px",
          borderBottom: "1px solid rgba(201,168,76,0.1)",
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
        }}>
          <div>
            <div style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 8 }}>
              Secure Payment
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 28, fontWeight: 300, color: "#f5f0e8" }}>
              Confirm Your Booking
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "rgba(245,240,232,0.3)", fontSize: 20, cursor: "pointer", padding: "4px", lineHeight: 1, marginTop: 4 }}
          >
            ✕
          </button>
        </div>

        {step === "success" ? (
          // ── Success state ──
          <div style={{ padding: "60px 32px", textAlign: "center" }}>
            <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 64, color: "#c9a84c", marginBottom: 16, lineHeight: 1 }}>✦</div>
            <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 28, color: "#f5f0e8", marginBottom: 8 }}>Payment Confirmed</div>
            <p style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.45)" }}>
              Your booking has been confirmed. Redirecting…
            </p>
          </div>
        ) : (
          <>
            {/* Booking summary */}
            <div style={{ padding: "24px 32px", background: "rgba(201,168,76,0.04)", borderBottom: "1px solid rgba(201,168,76,0.08)" }}>
              <div style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 16 }}>
                Booking Summary
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", marginBottom: 16 }}>
                {[
                  { label: "Room",      value: room ? `Room ${room.room_number} · ${room.type}` : `Room #${booking.room}` },
                  { label: "Duration",  value: `${nights} night${nights !== 1 ? "s" : ""}` },
                  { label: "Check-in",  value: formatDate(booking.check_in_date)  },
                  { label: "Check-out", value: formatDate(booking.check_out_date) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <div style={{ fontFamily: "'Jost'", fontSize: 9, color: "rgba(245,240,232,0.3)", letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.7)" }}>{value}</div>
                  </div>
                ))}
              </div>
              <div style={{ height: 1, background: "rgba(201,168,76,0.12)", margin: "16px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "'Jost'", fontSize: 12, color: "rgba(245,240,232,0.45)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Total Amount Due</span>
                <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 32, fontWeight: 300, color: "#c9a84c" }}>{peso(booking.total_amount)}</span>
              </div>
            </div>

            {/* Card form */}
            <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Placeholder notice — remove when integrating Stripe */}
              <div style={{
                padding: "10px 14px", background: "rgba(201,168,76,0.06)",
                border: "1px solid rgba(201,168,76,0.15)",
                fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.35)",
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ color: "#c9a84c", fontSize: 12 }}>ℹ</span>
                Demo mode — no real charge will be made.
              </div>

              {/* Visual card chip strip */}
              <div style={{
                background: "linear-gradient(135deg, #1a1410 0%, #13110e 100%)",
                border: "1px solid rgba(201,168,76,0.15)",
                padding: "20px 20px 16px", position: "relative", overflow: "hidden",
              }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.06)" }} />
                <div style={{ position: "absolute", top: -10, right: 20, width: 80, height: 80, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.04)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 36, height: 28, background: "rgba(201,168,76,0.2)", border: "1px solid rgba(201,168,76,0.3)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 18, height: 14, border: "1px solid rgba(201,168,76,0.5)", borderRadius: 2 }} />
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 14, color: "rgba(201,168,76,0.5)", letterSpacing: "0.1em" }}>AURUM</div>
                </div>
                <div style={{ fontFamily: "'Jost'", fontSize: 16, fontWeight: 300, color: "rgba(245,240,232,0.6)", letterSpacing: "0.2em", marginBottom: 12 }}>
                  {form.card_number || "•••• •••• •••• ••••"}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "'Jost'", fontSize: 8, color: "rgba(245,240,232,0.25)", letterSpacing: "0.2em", marginBottom: 2 }}>CARD HOLDER</div>
                    <div style={{ fontFamily: "'Jost'", fontSize: 12, color: "rgba(245,240,232,0.5)", letterSpacing: "0.05em" }}>{form.card_name || "YOUR NAME"}</div>
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Jost'", fontSize: 8, color: "rgba(245,240,232,0.25)", letterSpacing: "0.2em", marginBottom: 2 }}>EXPIRES</div>
                    <div style={{ fontFamily: "'Jost'", fontSize: 12, color: "rgba(245,240,232,0.5)" }}>{form.expiry || "MM/YY"}</div>
                  </div>
                </div>
              </div>

              {/* Fields */}
              <div>
                <label style={labelStyle}>Name on Card</label>
                <input
                  type="text" value={form.card_name} className="luxury-input"
                  onChange={(e) => setField("card_name", e.target.value)}
                  placeholder="Juan dela Cruz" style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Card Number</label>
                <input
                  type="text" value={form.card_number} className="luxury-input"
                  onChange={(e) => setField("card_number", formatCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456" maxLength={19} style={{ ...inputStyle, letterSpacing: "0.12em" }}
                />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelStyle}>Expiry Date</label>
                  <input
                    type="text" value={form.expiry} className="luxury-input"
                    onChange={(e) => setField("expiry", formatExpiry(e.target.value))}
                    placeholder="MM/YY" maxLength={5} style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CVV</label>
                  <input
                    type="password" value={form.cvv} className="luxury-input"
                    onChange={(e) => setField("cvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                    placeholder="•••" maxLength={4} style={inputStyle}
                  />
                </div>
              </div>

              {error && (
                <div style={{ padding: "12px 14px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontFamily: "'Jost'", fontSize: 13, color: "#f87171" }}>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button
                  onClick={onClose}
                  style={{ flex: 1, padding: "14px", background: "transparent", border: "1px solid rgba(245,240,232,0.1)", color: "rgba(245,240,232,0.4)", fontFamily: "'Jost'", fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  onClick={processPayment} disabled={processing}
                  style={{
                    flex: 2, padding: "14px", background: processing ? "rgba(201,168,76,0.5)" : "#c9a84c",
                    border: "none", color: "#0c0a09", fontFamily: "'Jost'", fontWeight: 600,
                    fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase",
                    cursor: processing ? "not-allowed" : "pointer", transition: "all 0.3s",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}
                >
                  {processing ? (
                    <>
                      <div style={{ width: 14, height: 14, border: "2px solid rgba(12,10,9,0.3)", borderTopColor: "#0c0a09", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                      Processing…
                    </>
                  ) : (
                    `Pay ${peso(booking.total_amount)}`
                  )}
                </button>
              </div>

              <p style={{ fontFamily: "'Jost'", fontSize: 10, color: "rgba(245,240,232,0.2)", textAlign: "center", letterSpacing: "0.05em", lineHeight: 1.6 }}>
                🔒 Secured · Stripe-ready integration · No real charge in demo mode
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  BOOKINGS TAB
// ══════════════════════════════════════════════════════
function BookingsTab({ userId }: { userId: number }) {
  const [bookings,   setBookings]   = useState<Booking[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [confirmId,  setConfirmId]  = useState<number | null>(null);
  const [payBooking, setPayBooking] = useState<Booking | null>(null);
  const [payRoom,    setPayRoom]    = useState<Room | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}bookings/?created_by=${userId}`)
      .then((r) => r.json())
      .then((d) => { setBookings(d.results ?? d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  async function openPayModal(booking: Booking) {
    setPayBooking(booking);
    setPayRoom(null);
    setLoadingRoom(true);
    try {
      const r = await fetch(`${API_BASE_URL}rooms/${booking.room}/`);
      const d = await r.json();
      setPayRoom(d);
    } catch (_) {}
    setLoadingRoom(false);
  }

  async function cancelBooking(id: number) {
    setCancelling(id);
    try {
      await fetch(`${API_BASE_URL}bookings/${id}/`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Cancelled" }),
      });
      setBookings((prev) => prev.map((b) => b.booking_id === id ? { ...b, status: "Cancelled" } : b));
    } finally {
      setCancelling(null); setConfirmId(null);
    }
  }

  function handlePaymentSuccess(bookingId: number) {
    setBookings((prev) => prev.map((b) => b.booking_id === bookingId ? { ...b, status: "Confirmed" } : b));
    setPayBooking(null);
  }

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ height: 120, background: "rgba(245,240,232,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );

  if (bookings.length === 0) return (
    <div style={{ textAlign: "center", padding: "72px 0" }}>
      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 56, color: "rgba(201,168,76,0.15)", marginBottom: 16 }}>✦</div>
      <p style={{ fontFamily: "'Jost'", fontSize: 14, color: "rgba(245,240,232,0.3)", marginBottom: 24 }}>No bookings yet.</p>
      <Link href="/website/rooms" style={{ fontFamily: "'Jost'", fontSize: 11, fontWeight: 600, color: "#c9a84c", textDecoration: "none", letterSpacing: "0.25em", textTransform: "uppercase", border: "1px solid rgba(201,168,76,0.3)", padding: "12px 28px" }}>
        Browse Rooms
      </Link>
    </div>
  );

  return (
    <>
      {/* Payment modal */}
      {payBooking && (
        <PaymentModal
          booking={payBooking}
          room={loadingRoom ? null : payRoom}
          onClose={() => setPayBooking(null)}
          onSuccess={handlePaymentSuccess}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {bookings.map((b) => {
          const s         = STATUS_STYLE[b.status] ?? STATUS_STYLE.Pending;
          const nights    = nightsBetween(b.check_in_date, b.check_out_date);
          const canCancel = b.status === "Pending" || b.status === "Confirmed";
          const canPay    = b.status === "Pending";

          return (
            <div
              key={b.booking_id}
              style={{ background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.08)", padding: "24px 28px", transition: "border-color 0.3s" }}
              onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.2)")}
              onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.08)")}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ flex: 1 }}>
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, fontWeight: 400, color: "#f5f0e8" }}>
                      Booking #{b.booking_id}
                    </div>
                    <div style={{ padding: "4px 12px", background: s.bg, border: `1px solid ${s.border}`, fontFamily: "'Jost'", fontSize: 10, fontWeight: 500, color: s.color, letterSpacing: "0.15em", textTransform: "uppercase" }}>
                      {b.status}
                    </div>
                    {canPay && (
                      <div style={{ padding: "4px 12px", background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)", fontFamily: "'Jost'", fontSize: 10, color: "rgba(251,191,36,0.6)", letterSpacing: "0.1em" }}>
                        Awaiting payment
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", gap: "8px 40px" }}>
                    {[
                      { label: "Check-in",  value: formatDate(b.check_in_date)  },
                      { label: "Check-out", value: formatDate(b.check_out_date) },
                      { label: "Duration",  value: `${nights} night${nights !== 1 ? "s" : ""}` },
                      { label: "Total",     value: peso(b.total_amount)          },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <div style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
                        <div style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.7)" }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {b.notes && (
                    <div style={{ marginTop: 14, fontFamily: "'Jost'", fontSize: 12, fontWeight: 300, color: "rgba(245,240,232,0.35)", fontStyle: "italic" }}>
                      Note: {b.notes}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ marginLeft: 24, flexShrink: 0, display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>

                  {/* Pay Now button */}
                  {canPay && (
                    <button
                      onClick={() => openPayModal(b)}
                      style={{
                        padding: "10px 20px", background: "#c9a84c", border: "none",
                        color: "#0c0a09", fontFamily: "'Jost'", fontWeight: 600,
                        fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase",
                        cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(201,168,76,0.35)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "none")}
                    >
                      Pay Now
                    </button>
                  )}

                  {/* Cancel button */}
                  {canCancel && (
                    confirmId === b.booking_id ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <span style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.5)" }}>Cancel this booking?</span>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => setConfirmId(null)}
                            style={{ padding: "8px 16px", background: "transparent", border: "1px solid rgba(245,240,232,0.15)", color: "rgba(245,240,232,0.5)", fontFamily: "'Jost'", fontSize: 11, cursor: "pointer" }}
                          >
                            Keep
                          </button>
                          <button
                            onClick={() => cancelBooking(b.booking_id)} disabled={cancelling === b.booking_id}
                            style={{ padding: "8px 16px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontFamily: "'Jost'", fontSize: 11, cursor: "pointer" }}
                          >
                            {cancelling === b.booking_id ? "…" : "Confirm"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(b.booking_id)}
                        style={{ padding: "9px 18px", background: "transparent", border: "1px solid rgba(239,68,68,0.2)", color: "rgba(248,113,113,0.6)", fontFamily: "'Jost'", fontSize: 11, cursor: "pointer", letterSpacing: "0.12em", textTransform: "uppercase", transition: "all 0.2s" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.5)"; (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.2)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.6)"; }}
                      >
                        Cancel
                      </button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ══════════════════════════════════════════════════════
//  TRANSACTIONS TAB
// ══════════════════════════════════════════════════════
function TransactionsTab({ userId }: { userId: number }) {
  const [txns,    setTxns]    = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}transactions/?created_by=${userId}`)
      .then((r) => r.json())
      .then((d) => { setTxns(d.results ?? d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [userId]);

  const total = txns.reduce((s, t) => s + parseFloat(t.amount), 0);

  const CATEGORY_COLOR: Record<string, string> = {
    "Room Bookings":  "#c9a84c",
    "Spa & Wellness": "#a78bfa",
    "Dining":         "#fb923c",
    "Others":         "#94a3b8",
  };

  if (loading) return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ height: 72, background: "rgba(245,240,232,0.03)", animation: "pulse 1.5s ease-in-out infinite" }} />
      ))}
    </div>
  );

  if (txns.length === 0) return (
    <div style={{ textAlign: "center", padding: "72px 0" }}>
      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 56, color: "rgba(201,168,76,0.15)", marginBottom: 16 }}>—</div>
      <p style={{ fontFamily: "'Jost'", fontSize: 14, color: "rgba(245,240,232,0.3)" }}>No transactions yet.</p>
    </div>
  );

  return (
    <div>
      <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.15)", padding: "20px 24px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: "'Jost'", fontSize: 11, fontWeight: 500, color: "rgba(245,240,232,0.45)", letterSpacing: "0.2em", textTransform: "uppercase" }}>Total Spent</div>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 32, fontWeight: 300, color: "#c9a84c" }}>{peso(total)}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {txns.map((t) => (
          <div key={t.transaction_id}
            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", background: "#0f0d0b", border: "1px solid rgba(245,240,232,0.04)", transition: "border-color 0.2s" }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.12)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(245,240,232,0.04)")}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 3, height: 36, background: CATEGORY_COLOR[t.category] ?? "#94a3b8", borderRadius: 2, flexShrink: 0 }} />
              <div>
                <div style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 400, color: "#f5f0e8", marginBottom: 3 }}>{t.description || t.category}</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontFamily: "'Jost'", fontSize: 10, fontWeight: 500, color: CATEGORY_COLOR[t.category] ?? "#94a3b8", letterSpacing: "0.15em", textTransform: "uppercase" }}>{t.category}</span>
                  <span style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.3)" }}>{formatDate(t.transaction_date)}</span>
                </div>
              </div>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, fontWeight: 400, color: "#c9a84c" }}>{peso(t.amount)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  PROFILE TAB
// ══════════════════════════════════════════════════════
function ProfileTab({ user, onUpdate }: { user: AuthUser; onUpdate: (u: AuthUser) => void }) {
  const [form,       setForm]       = useState({ name: user.name, email: user.email });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);         // holds the selected file
  const [preview,    setPreview]    = useState<string | null>(user.avatar_url ?? null); // preview URL
  const [saving,     setSaving]     = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
    if (!avatarFile) {
      setPreview(user.avatar_url ?? null);
    }
  }, [user.avatar_url]);  

  function set<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate it's an image
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file."); return;
    }
    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB."); return;
    }

    setAvatarFile(file);
    setError("");
    // Show local preview immediately
    setPreview(URL.createObjectURL(file));
  }
async function handleSave() {
  setSaving(true); setSuccess(false); setError("");
  try {
    const formData = new FormData();
    formData.append("name",  form.name);
    formData.append("email", form.email);
    if (avatarFile) {
      formData.append("avatar_url", avatarFile);
    }

    const res = await fetch(`${API_BASE_URL}users/${user.id}/`, {
      method: "PATCH",
      body: formData,
    });

    if (!res.ok) throw new Error("Failed to update profile.");
    const updated = await res.json();

    // ✅ Build the full merged user object
    const newUser: AuthUser = { ...user, ...updated };

    // ✅ Update localStorage
    localStorage.setItem("auth_user", JSON.stringify(newUser));

    // ✅ Push up to parent so navbar re-renders with new avatar
    onUpdate(newUser);

    // ✅ Also sync the local preview to the URL returned by Django
    if (updated.avatar_url) {
      setPreview(updated.avatar_url);
    }

    setSuccess(true);
    setAvatarFile(null);
    setTimeout(() => setSuccess(false), 3000);
  } catch (e: any) {
    setError(e.message);
  } finally {
    setSaving(false);
  }
}

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(245,240,232,0.04)",
    border: "1px solid rgba(245,240,232,0.12)", color: "#f5f0e8",
    fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 300,
    padding: "14px 18px", outline: "none", transition: "border-color 0.3s",
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: "'Jost'", fontSize: 9, fontWeight: 600,
    color: "rgba(245,240,232,0.35)", letterSpacing: "0.3em",
    textTransform: "uppercase", display: "block", marginBottom: 8,
  };

  return (
    <div style={{ maxWidth: 560 }}>

      {/* Avatar preview card */}
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 36, padding: "24px", background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.1)" }}>
        
        {/* Avatar circle */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.3)", overflow: "hidden", background: "linear-gradient(135deg, #1a1410, #0f0c08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {preview ? (
              <img src={preview} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 28, color: "rgba(201,168,76,0.5)" }}>
                {user.name?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          {/* Small edit badge */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{ position: "absolute", bottom: 0, right: 0, width: 22, height: 22, borderRadius: "50%", background: "#c9a84c", border: "2px solid #0c0a09", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 10 }}
            title="Change photo"
          >
            ✎
          </button>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 20, color: "#f5f0e8", marginBottom: 4 }}>{user.name}</div>
          <div style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.35)", letterSpacing: "0.1em" }}>{user.email}</div>
          <div style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 6 }}>{user.role}</div>
        </div>
      </div>

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} style={inputStyle} className="luxury-input" />
        </div>
        <div>
          <label style={labelStyle}>Email Address</label>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} style={inputStyle} className="luxury-input" />
        </div>

        {/* File upload — replaces Avatar URL text input */}
        <div>
          <label style={labelStyle}>Profile Photo</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: "none" }} // hidden — triggered by button below
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            style={{
              ...inputStyle,
              display: "flex", alignItems: "center", gap: 12,
              cursor: "pointer", color: "rgba(245,240,232,0.35)",
            }}
          >
            <span style={{ fontSize: 18 }}>📷</span>
            <span style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300 }}>
              {avatarFile ? avatarFile.name : "Click to upload a photo"}
            </span>
            {avatarFile && (
              <span style={{ marginLeft: "auto", fontFamily: "'Jost'", fontSize: 10, color: "#c9a84c" }}>
                {(avatarFile.size / 1024).toFixed(0)} KB
              </span>
            )}
          </div>
          <div style={{ fontFamily: "'Jost'", fontSize: 10, color: "rgba(245,240,232,0.2)", marginTop: 6, letterSpacing: "0.05em" }}>
            JPG, PNG, WEBP — max 5MB
          </div>
        </div>
      </div>

      {error   && <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 16, fontFamily: "'Jost'", fontSize: 13, color: "#f87171" }}>{error}</div>}
      {success && <div style={{ padding: "12px 16px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", marginBottom: 16, fontFamily: "'Jost'", fontSize: 13, color: "#4ade80" }}>✦ Profile updated successfully.</div>}

      <button
        onClick={handleSave} disabled={saving}
        style={{ padding: "14px 36px", background: "#c9a84c", color: "#0c0a09", fontFamily: "'Jost'", fontWeight: 600, fontSize: 11, letterSpacing: "0.25em", textTransform: "uppercase", border: "none", cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1, transition: "all 0.3s" }}
        onMouseEnter={(e) => !saving && ((e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(201,168,76,0.3)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.boxShadow = "none")}
      >
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}

// ══════════════════════════════════════════════════════
//  MAIN ACCOUNT PAGE
// ══════════════════════════════════════════════════════
type Tab = "bookings" | "transactions" | "profile";

export default function AccountPage() {
  const router = useRouter();
  const [user,    setUser]    = useState<AuthUser | null>(null);
  const [tab,     setTab]     = useState<Tab>("bookings");

  useEffect(() => {
    const u = getAuthUser();
    if (!u) { router.push("/login"); return; }
    if (u.role !== "guest") { router.push("/admin/dashboard"); return; }
    setUser(u);

    // Still fetch guestId for TransactionsTab

  }, [router]);

  function handleLogout() {
    logout();
    router.push("/login");
  }

  if (!user) return null;

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "bookings",     label: "My Bookings",  icon: "🏨" },
    { key: "transactions", label: "Transactions", icon: "💳" },
    { key: "profile",      label: "Profile",      icon: "👤" },
  ];

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <div style={{ background: "#0c0a09", minHeight: "100vh" }}>

        {/* Nav */}
        <nav style={{ borderBottom: "1px solid rgba(201,168,76,0.1)", padding: "20px 60px", display: "flex", justifyContent: "space-between", alignItems: "center", position: "sticky", top: 0, background: "rgba(12,10,9,0.95)", backdropFilter: "blur(12px)", zIndex: 50 }}>
          <Link href="/website" style={{ textDecoration: "none" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 300, color: "#f5f0e8", letterSpacing: "0.12em" }}>AURUM</div>
            <div style={{ fontFamily: "'Jost'", fontSize: 8, color: "#c9a84c", letterSpacing: "0.4em", textTransform: "uppercase" }}>Grand Hotel</div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(201,168,76,0.3)", overflow: "hidden", background: "#1a1410", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {user.avatar_url
                  ? <img src={user.avatar_url} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 16, color: "#c9a84c" }}>{user.name?.charAt(0).toUpperCase()}</span>
                }
              </div>
              <div>
                <div style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 400, color: "#f5f0e8" }}>{user.name}</div>
                <div style={{ fontFamily: "'Jost'", fontSize: 10, color: "rgba(245,240,232,0.35)" }}>{user.email}</div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              style={{ padding: "9px 20px", background: "transparent", border: "1px solid rgba(245,240,232,0.12)", color: "rgba(245,240,232,0.45)", fontFamily: "'Jost'", fontSize: 11, letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.4)"; (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(245,240,232,0.12)"; (e.currentTarget as HTMLButtonElement).style.color = "rgba(245,240,232,0.45)"; }}
            >
              Sign Out
            </button>
          </div>
        </nav>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 60px", display: "grid", gridTemplateColumns: "240px 1fr", gap: 48, animation: "fadeUp 0.6s ease forwards" }}>

          {/* Sidebar */}
          <aside>
            <div style={{ position: "sticky", top: 100 }}>
              <div style={{ background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.15)", padding: "28px 24px", marginBottom: 4 }}>
                <div style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 10 }}>My Account</div>
                <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, fontWeight: 400, color: "#f5f0e8", lineHeight: 1.2 }}>{user.name}</div>
                <div style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.35)", marginTop: 4 }}>{user.email}</div>
                <div style={{ height: 1, background: "linear-gradient(90deg, #c9a84c, transparent)", marginTop: 20 }} />
              </div>

              {TABS.map((t) => (
                <button
                  key={t.key} onClick={() => setTab(t.key)}
                  style={{
                    width: "100%", textAlign: "left", padding: "16px 24px",
                    background: tab === t.key ? "rgba(201,168,76,0.08)" : "transparent",
                    borderTop: "none",
                    borderLeft:   tab === t.key ? "1px solid rgba(201,168,76,0.25)" : "1px solid rgba(245,240,232,0.04)",
                    borderRight:  tab === t.key ? "1px solid rgba(201,168,76,0.25)" : "1px solid rgba(245,240,232,0.04)",
                    borderBottom: tab === t.key ? "1px solid rgba(201,168,76,0.25)" : "1px solid rgba(245,240,232,0.04)",
                    color: tab === t.key ? "#c9a84c" : "rgba(245,240,232,0.45)",
                    fontFamily: "'Jost'", fontSize: 13, fontWeight: tab === t.key ? 500 : 300,
                    cursor: "pointer", transition: "all 0.2s",
                    display: "flex", alignItems: "center", gap: 12, letterSpacing: "0.02em",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{t.icon}</span>
                  {t.label}
                  {tab === t.key && <span style={{ marginLeft: "auto", width: 4, height: 4, borderRadius: "50%", background: "#c9a84c" }} />}
                </button>
              ))}

              <div style={{ marginTop: 24 }}>
                <Link
                  href="/website/rooms"
                  style={{ display: "block", textAlign: "center", padding: "13px", background: "#c9a84c", color: "#0c0a09", fontFamily: "'Jost'", fontWeight: 600, fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", textDecoration: "none", transition: "all 0.3s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 8px 24px rgba(201,168,76,0.3)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.boxShadow = "none")}
                >
                  Book a Room
                </Link>
              </div>
            </div>
          </aside>

          {/* Main */}
          <main>
            <div style={{ marginBottom: 32, paddingBottom: 24, borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
              <div style={{ fontFamily: "'Jost'", fontSize: 10, fontWeight: 500, color: "#c9a84c", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 8 }}>
                {TABS.find((t) => t.key === tab)?.icon} {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </div>
              <h2 style={{ fontFamily: "'Cormorant Garamond'", fontSize: 36, fontWeight: 300, color: "#f5f0e8" }}>
                {tab === "bookings"     && "My Bookings"}
                {tab === "transactions" && "Transaction History"}
                {tab === "profile"      && "My Profile"}
              </h2>
            </div>

            <>
              {tab === "bookings"     && <BookingsTab userId={user.id} />}
              {tab === "transactions" && <TransactionsTab userId={user.id} />}
              {tab === "profile" && <ProfileTab user={user} onUpdate={setUser} />}
              
            </>
          </main>
        </div>
      </div>
    </>
  );
}