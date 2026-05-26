"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";
import { getAuthUser } from "@/services/authServices";

interface Room {
  room_id:         number;
  room_number:     string;
  floor:           number;
  type:            string;
  price_per_night: string;
  max_occupancy:   number;
  image_url:       string | null;
  description:     string;
}

interface BookingForm {
  check_in:  string;
  check_out: string;
  notes:     string;
}


const today    = new Date().toISOString().split("T")[0];

function nightsBetween(a: string, b: string): number {
  if (!a || !b) return 0;
  return Math.max(0, Math.floor((new Date(b).getTime() - new Date(a).getTime()) / (1000 * 60 * 60 * 24)));
}

export default function RoomDetailPage() {
  const params  = useParams();
  const router  = useRouter();
  const room_id = params?.id as string;

  const [room,       setRoom]       = useState<Room | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [imgErr,     setImgErr]     = useState(false);

  const [form, setForm] = useState<BookingForm>({
    check_in: "", check_out: "", notes: "",
  });

  useEffect(() => {
    if (!room_id) return;
    fetch(`${API_BASE_URL}rooms/${room_id}/`)
      .then((r) => { if (!r.ok) throw new Error("Room not found"); return r.json(); })
      .then((d) => { setRoom(d); setLoading(false); })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, [room_id]);

  function set<K extends keyof BookingForm>(key: K, val: BookingForm[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const nights        = nightsBetween(form.check_in, form.check_out);
  const pricePerNight = room ? parseFloat(room.price_per_night) : 0;
  const totalAmount   = nights * pricePerNight;

  async function handleSubmit() {
    if (!room) return;
    if (!form.check_in || !form.check_out) {
      setError("Please select check-in and check-out dates."); return;
    }
    if (nights <= 0) { setError("Check-out must be after check-in."); return; }

    setSubmitting(true); setError(null);

    try {
      const authUser = getAuthUser();
      const guestRes = await fetch(`${API_BASE_URL}guests/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          full_name: authUser?.name ?? "Guest", 
          email: authUser?.email ?? "",
          phone: authUser?.phone ?? "N/A",
          id_type: "Other", 
          id_number: "N/A" }),
      });
      if (!guestRes.ok) throw new Error("Failed to register guest details.");
      const guest = await guestRes.json();

      const bookingRes = await fetch(`${API_BASE_URL}bookings/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guest: guest.guest_id, room: room.room_id,
          check_in_date: form.check_in, check_out_date: form.check_out,
          total_amount: totalAmount.toFixed(2),
          created_by: getAuthUser()?.id ?? null,
          status: "Pending", room_status: "Available", notes: form.notes,
        }),
      });
      if (!bookingRes.ok) throw new Error("Failed to submit booking.");
      const booking = await bookingRes.json();

      const p = new URLSearchParams({
        booking_id:   String(booking.booking_id),
        room_number:  room.room_number,
        room_type:    room.type,
        guest_name:   authUser?.name ?? "Guest",
        check_in:     form.check_in,
        check_out:    form.check_out,
        nights:       String(nights),
        total_amount: totalAmount.toFixed(2),
      });
      router.push(`/website/booking/confirm?${p}`);
    } catch (e: any) {
      setError(e.message);
      setSubmitting(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", background: "rgba(245,240,232,0.04)",
    border: "1px solid rgba(245,240,232,0.12)", color: "#f5f0e8",
    fontFamily: "'Jost', sans-serif", fontSize: 14, fontWeight: 300,
    padding: "14px 16px", outline: "none", transition: "border-color 0.3s",
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Jost'", fontSize: 10, fontWeight: 500,
    letterSpacing: "0.2em", textTransform: "uppercase",
    color: "rgba(245,240,232,0.4)", display: "block", marginBottom: 8,
  };

  if (loading) return (
    <div style={{ background: "#0c0a09", minHeight: "100vh", paddingTop: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 32, color: "rgba(201,168,76,0.3)" }}>Loading…</div>
    </div>
  );

  if (!room) return (
    <div style={{ background: "#0c0a09", minHeight: "100vh", paddingTop: 120, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 48, color: "rgba(201,168,76,0.3)" }}>404</div>
      <p style={{ fontFamily: "'Jost'", fontSize: 14, color: "rgba(245,240,232,0.4)" }}>Room not found.</p>
      <Link href="/website/rooms" className="btn-outline">Back to Rooms</Link>
    </div>
  );

  return (
    <div style={{ background: "#0c0a09", minHeight: "100vh", paddingTop: 80 }}>

      {/* ── Hero image ── */}
      <div style={{ height: "55vh", position: "relative", overflow: "hidden" }}>
        {room.image_url && !imgErr ? (
          <img src={room.image_url} alt={`Room ${room.room_number}`} onError={() => setImgErr(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #1a1410 0%, #0f0c08 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 96, color: "rgba(201,168,76,0.1)" }}>✦</span>
          </div>
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(12,10,9,0.3) 0%, transparent 40%, rgba(12,10,9,0.95) 100%)" }} />

        {/* Breadcrumb */}
        <div style={{ position: "absolute", top: 28, left: 60, display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/website/rooms" style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.5)", textDecoration: "none", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            ← Rooms
          </Link>
          <span style={{ color: "rgba(201,168,76,0.4)", fontSize: 10 }}>✦</span>
          <span style={{ fontFamily: "'Jost'", fontSize: 11, color: "#c9a84c", letterSpacing: "0.15em", textTransform: "uppercase" }}>Room {room.room_number}</span>
        </div>

        <div style={{ position: "absolute", bottom: 40, left: 60 }}>
          <div style={{ fontFamily: "'Jost'", fontSize: 10, fontWeight: 500, color: "#c9a84c", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 12, border: "1px solid rgba(201,168,76,0.4)", display: "inline-block", padding: "5px 14px" }}>
            {room.type}
          </div>
          <h1 className="display-heading" style={{ fontSize: "clamp(36px, 5vw, 64px)" }}>Room {room.room_number}</h1>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 72 }}>

          {/* Left — info */}
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, marginBottom: 48 }}>
              {[
                { label: "Floor",    value: `Floor ${room.floor}` },
                { label: "Capacity", value: `${room.max_occupancy} Guests` },
                { label: "Price",    value: `₱${parseFloat(room.price_per_night).toLocaleString()}/night` },
              ].map(({ label, value }) => (
                <div key={label} style={{ padding: "20px 24px", background: "#13110e", border: "1px solid rgba(201,168,76,0.08)", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 500, color: "#c9a84c", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 20, fontWeight: 400, color: "#f5f0e8" }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginBottom: 48 }}>
              <div className="section-label" style={{ marginBottom: 20 }}>About This Room</div>
              <p style={{ fontFamily: "'Jost'", fontSize: 14, fontWeight: 300, color: "rgba(245,240,232,0.55)", lineHeight: 2 }}>
                {room.description || `Experience the finest in ${room.type.toLowerCase()} accommodation at Aurum Grand Hotel. Room ${room.room_number} offers a perfect sanctuary of calm and sophistication, with every detail thoughtfully considered for your utmost comfort.`}
              </p>
            </div>

            <div>
              <div className="section-label" style={{ marginBottom: 20 }}>Included in Your Stay</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                {["Daily Housekeeping","Premium Toiletries","High-Speed WiFi","Minibar Access","Room Service 24/7","Daily Breakfast","Airport Transfer","Concierge Service"].map((item) => (
                  <div key={item} style={{ padding: "14px 18px", background: "#13110e", border: "1px solid rgba(245,240,232,0.04)", display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ color: "#c9a84c", fontSize: 10 }}>✦</span>
                    <span style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.55)" }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — booking */}
          <div style={{ position: "sticky", top: 100, alignSelf: "flex-start" }}>
            <div style={{ background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.2)", padding: "36px 32px" }}>
              <div style={{ textAlign: "center", marginBottom: 32, paddingBottom: 28, borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 44, fontWeight: 300, color: "#c9a84c" }}>
                  ₱{parseFloat(room.price_per_night).toLocaleString()}
                </div>
                <div style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.3)", letterSpacing: "0.15em", textTransform: "uppercase", marginTop: 4 }}>per night</div>
              </div>

              {/* Step tabs */}
              {/* <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, marginBottom: 28 }}>
                {(["details","booking"] as const).map((s) => (
                  <button key={s} onClick={() => setStep(s)} style={{
                    padding: "11px", fontFamily: "'Jost'", fontSize: 11, fontWeight: 500,
                    letterSpacing: "0.15em", textTransform: "uppercase", cursor: "pointer", border: "none",
                    background: step === s ? "#c9a84c" : "rgba(245,240,232,0.05)",
                    color:      step === s ? "#0c0a09"  : "rgba(245,240,232,0.4)",
                  }}>
                    {s === "details" ? "Stay Dates" : "Guest Info"}
                  </button>
                ))}
              </div> */}

              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={labelStyle}>Check-in Date *</label>
                    <input type="date" min={today} value={form.check_in}
                      onChange={(e) => set("check_in", e.target.value)}
                      className="luxury-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Check-out Date *</label>
                    <input type="date" min={form.check_in || today} value={form.check_out}
                      onChange={(e) => set("check_out", e.target.value)}
                      className="luxury-input" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Special Requests</label>
                    <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
                      placeholder="Any special requests or notes..."
                      className="luxury-input" style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} />
                  </div>

                  {nights > 0 && (
                    <div style={{ background: "rgba(201,168,76,0.06)", border: "1px solid rgba(201,168,76,0.2)", padding: "18px 16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                        <span style={{ fontFamily: "'Jost'", fontSize: 12, color: "rgba(245,240,232,0.5)" }}>₱{pricePerNight.toLocaleString()} × {nights} night{nights > 1 ? "s" : ""}</span>
                        <span style={{ fontFamily: "'Jost'", fontSize: 12, color: "rgba(245,240,232,0.7)" }}>₱{totalAmount.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 1, background: "rgba(201,168,76,0.15)", margin: "12px 0" }} />
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 500, color: "#f5f0e8" }}>Total</span>
                        <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, color: "#c9a84c" }}>₱{totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
<button onClick={handleSubmit} disabled={submitting} className="btn-gold"
                style={{ textAlign: "center", opacity: submitting ? 0.7 : 1, cursor: submitting ? "not-allowed" : "pointer" }}>
                {submitting ? "Submitting…" : "Confirm Booking"}
              </button>
                </div>
              

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}