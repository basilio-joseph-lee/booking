"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function ConfirmationContent() {
  const params       = useSearchParams();
  const booking_id   = params.get("booking_id");
  const room_number  = params.get("room_number");
  const room_type    = params.get("room_type");
  const guest_name   = params.get("guest_name");
  const check_in     = params.get("check_in");
  const check_out    = params.get("check_out");
  const nights       = params.get("nights");
  const total_amount = params.get("total_amount");

  function formatDate(d: string | null) {
    if (!d) return "—";
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }

  const details = [
    { label: "Booking Reference", value: booking_id   ? `#${booking_id}`                        : "—", highlight: true  },
    { label: "Guest Name",        value: guest_name   ?? "—",                                          highlight: false },
    { label: "Room",              value: room_number  ? `Room ${room_number} · ${room_type}`    : "—", highlight: false },
    { label: "Check-in",         value: formatDate(check_in),                                          highlight: false },
    { label: "Check-out",        value: formatDate(check_out),                                         highlight: false },
    { label: "Duration",         value: nights       ? `${nights} night${Number(nights) > 1 ? "s" : ""}` : "—", highlight: false },
    { label: "Total Amount",     value: total_amount ? `₱${parseFloat(total_amount).toLocaleString()}` : "—", highlight: true  },
  ];

  return (
    <div style={{ background: "#0c0a09", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "120px 40px 80px" }}>
      <div style={{ position: "fixed", inset: 0, background: "radial-gradient(ellipse at 50% 40%, rgba(201,168,76,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", width: "100%", maxWidth: 600, animation: "fadeUp 0.8s ease forwards" }}>
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)" }} />

        <div style={{ background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.2)", borderTop: "none", padding: "52px 52px 48px" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{ width: 72, height: 72, border: "1px solid rgba(201,168,76,0.3)", borderRadius: "50%", margin: "0 auto 24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
              ✦
            </div>
            <div className="section-label" style={{ justifyContent: "center", marginBottom: 16 }}>Booking Confirmed</div>
            <h1 className="display-heading" style={{ fontSize: "clamp(28px, 4vw, 44px)", marginBottom: 12 }}>
              Thank You, <em style={{ color: "#c9a84c", fontStyle: "italic" }}>{guest_name?.split(" ")[0] ?? "Guest"}</em>
            </h1>
            <p style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.45)", lineHeight: 1.8, maxWidth: 380, margin: "0 auto" }}>
              Your reservation is pending confirmation. Our team will reach out shortly to finalize your stay at Aurum Grand Hotel.
            </p>
          </div>

          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)", margin: "32px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {details.map(({ label, value, highlight }, i) => (
              <div key={label} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 0",
                borderBottom: i < details.length - 1 ? "1px solid rgba(245,240,232,0.05)" : "none",
              }}>
                <span style={{ fontFamily: "'Jost'", fontSize: 11, fontWeight: 400, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(245,240,232,0.35)" }}>
                  {label}
                </span>
                <span style={{
                  fontFamily: highlight ? "'Cormorant Garamond'" : "'Jost'",
                  fontSize:   highlight ? 22 : 14,
                  fontWeight: highlight ? 400 : 300,
                  color:      highlight ? "#c9a84c" : "#f5f0e8",
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)", margin: "32px 0" }} />

          <div style={{ background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.12)", padding: "18px 20px", marginBottom: 32 }}>
            <p style={{ fontFamily: "'Jost'", fontSize: 12, fontWeight: 300, color: "rgba(245,240,232,0.45)", lineHeight: 1.8 }}>
              📩 A confirmation email will be sent to your registered address. Please present your booking reference upon arrival at the front desk.
            </p>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <button onClick={() => window.print()} className="btn-outline" style={{ flex: 1, textAlign: "center", cursor: "pointer" }}>
              🖨 Print / Save
            </button>
            <Link href="/website/rooms" className="btn-gold" style={{ flex: 2, textAlign: "center" }}>
              Browse More Rooms
            </Link>
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link href="/website" style={{ fontFamily: "'Jost'", fontSize: 12, color: "rgba(245,240,232,0.3)", textDecoration: "none", letterSpacing: "0.1em" }}>
              ← Return to Home
            </Link>
          </div>
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)" }} />
      </div>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @media print { nav, footer, .btn-outline, .btn-gold { display: none !important; } body { background: white !important; color: black !important; } }
      `}</style>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div style={{ background: "#0c0a09", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 32, color: "rgba(201,168,76,0.3)" }}>Loading…</div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}