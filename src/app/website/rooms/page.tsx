"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";

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

const TYPES = ["All", "Standard", "Deluxe", "Suite"];

const TYPE_DESC: Record<string, string> = {
  Standard: "Thoughtfully appointed comfort for the discerning traveller.",
  Deluxe:   "Elevated interiors with premium furnishings and enhanced amenities.",
  Suite:    "The pinnacle of Aurum living — space, privacy, and pure indulgence.",
};

export default function RoomsPage() {
  const [rooms,      setRooms]      = useState<Room[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [maxPrice,   setMaxPrice]   = useState(50000);
  const [imgErrors,  setImgErrors]  = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch(`${API_BASE_URL}rooms/`)
      .then((r) => r.json())
      .then((d) => { setRooms(d.results ?? d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = rooms.filter((r) => {
    const matchType  = filterType === "All" || r.type === filterType;
    const matchPrice = parseFloat(r.price_per_night) <= maxPrice;
    return matchType && matchPrice;
  });

  const prices = rooms.map((r) => parseFloat(r.price_per_night));
  const minP   = prices.length ? Math.min(...prices) : 0;
  const maxP   = prices.length ? Math.max(...prices) : 50000;

  return (
    <div style={{ background: "#0c0a09", minHeight: "100vh", paddingTop: 100 }}>

      {/* ── Page hero ── */}
      <div style={{ padding: "72px 60px 60px", position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 80% 50%, rgba(201,168,76,0.04), transparent 60%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Accommodations</div>
          <h1 className="display-heading" style={{ fontSize: "clamp(40px, 6vw, 72px)", marginBottom: 16 }}>
            Rooms & <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Suites</em>
          </h1>
          <p style={{ fontFamily: "'Jost'", fontSize: 14, fontWeight: 300, color: "rgba(245,240,232,0.45)", maxWidth: 500, lineHeight: 1.8 }}>
            Each room at Aurum is a sanctuary — meticulously designed to envelop you in warmth, elegance, and absolute comfort.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "60px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 60 }}>

          {/* ── Sidebar ── */}
          <aside>
            <div style={{ position: "sticky", top: 100 }}>
              <div style={{ fontFamily: "'Jost'", fontSize: 10, fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c", marginBottom: 32 }}>
                Filter Rooms
              </div>

              <div style={{ marginBottom: 40 }}>
                <div style={{ fontFamily: "'Jost'", fontSize: 11, fontWeight: 500, color: "rgba(245,240,232,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Room Type</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {TYPES.map((t) => (
                    <button key={t} onClick={() => setFilterType(t)} style={{
                      width: "100%", textAlign: "left", padding: "11px 16px",
                      background:  filterType === t ? "rgba(201,168,76,0.1)" : "transparent",
                      border:      `1px solid ${filterType === t ? "rgba(201,168,76,0.4)" : "rgba(245,240,232,0.06)"}`,
                      color:       filterType === t ? "#c9a84c" : "rgba(245,240,232,0.5)",
                      fontFamily:  "'Jost'", fontSize: 13, fontWeight: filterType === t ? 500 : 300,
                      cursor: "pointer", transition: "all 0.2s", letterSpacing: "0.05em",
                    }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 40 }}>
                <div style={{ fontFamily: "'Jost'", fontSize: 11, fontWeight: 500, color: "rgba(245,240,232,0.4)", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16 }}>Max Price / Night</div>
                <input type="range" min={minP} max={maxP || 50000} value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#c9a84c", cursor: "pointer" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                  <span style={{ fontFamily: "'Jost'", fontSize: 12, color: "rgba(245,240,232,0.3)" }}>₱{minP.toLocaleString()}</span>
                  <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 16, color: "#c9a84c" }}>₱{maxPrice.toLocaleString()}</span>
                </div>
              </div>

              <div style={{ padding: 16, border: "1px solid rgba(201,168,76,0.12)", textAlign: "center" }}>
                <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 32, color: "#c9a84c" }}>{filtered.length}</div>
                <div style={{ fontFamily: "'Jost'", fontSize: 10, color: "rgba(245,240,232,0.35)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 4 }}>Rooms Available</div>
              </div>
            </div>
          </aside>

          {/* ── Grid ── */}
          <div>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ background: "#13110e" }}>
                    <div style={{ height: 260, background: "rgba(245,240,232,0.04)" }} />
                    <div style={{ padding: 24 }}>
                      <div style={{ height: 20, width: "60%", background: "rgba(245,240,232,0.06)", marginBottom: 10 }} />
                      <div style={{ height: 12, width: "80%", background: "rgba(245,240,232,0.04)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "80px 0" }}>
                <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 48, color: "rgba(201,168,76,0.2)", marginBottom: 16 }}>—</div>
                <p style={{ fontFamily: "'Jost'", fontSize: 14, color: "rgba(245,240,232,0.3)" }}>No rooms match your filters.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                {filtered.map((room) => (
                  <div key={room.room_id} className="room-card" style={{ background: "#13110e", overflow: "hidden" }}>
                    <div style={{ height: 260, overflow: "hidden", background: "#1a1714", position: "relative" }}>
                      {room.image_url && !imgErrors[room.room_id] ? (
                        <img src={room.image_url} alt={`Room ${room.room_number}`} className="room-img"
                          onError={() => setImgErrors((e) => ({ ...e, [room.room_id]: true }))}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        />
                      ) : (
                        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1410, #0f0c08)" }}>
                          <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 48, color: "rgba(201,168,76,0.15)" }}>✦</span>
                        </div>
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,10,9,0.85) 0%, transparent 60%)" }} />
                      <div style={{ position: "absolute", top: 16, left: 16, fontFamily: "'Jost'", fontSize: 9, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.5)", padding: "4px 10px", background: "rgba(12,10,9,0.6)" }}>
                        {room.type}
                      </div>
                      <div style={{ position: "absolute", bottom: 16, left: 16, fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.6)", display: "flex", alignItems: "center", gap: 6 }}>
                        👤 Up to {room.max_occupancy} guests
                      </div>
                    </div>

                    <div style={{ padding: "24px 24px 28px" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 22, fontWeight: 400, color: "#f5f0e8", marginBottom: 6 }}>Room {room.room_number}</div>
                      <p style={{ fontFamily: "'Jost'", fontSize: 12, fontWeight: 300, color: "rgba(245,240,232,0.4)", lineHeight: 1.7, marginBottom: 20, minHeight: 36 }}>
                        {room.description || TYPE_DESC[room.type] || ""}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(245,240,232,0.06)", paddingTop: 18 }}>
                        <div>
                          <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 26, fontWeight: 400, color: "#c9a84c" }}>₱{parseFloat(room.price_per_night).toLocaleString()}</span>
                          <span style={{ fontFamily: "'Jost'", fontSize: 10, color: "rgba(245,240,232,0.3)", marginLeft: 5, letterSpacing: "0.1em" }}>/NIGHT</span>
                        </div>
                        <Link href={`/website/rooms/${room.room_id}`} className="btn-gold" style={{ fontSize: 10, padding: "10px 18px" }}>Book Room</Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}