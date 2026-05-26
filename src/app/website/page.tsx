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

const AMENITIES = [
  { icon: "✦", title: "Michelin Dining",   desc: "Award-winning cuisine crafted by world-class chefs in our signature restaurant." },
  { icon: "✦", title: "Infinity Spa",      desc: "Surrender to serenity with bespoke treatments and ancient healing rituals." },
  { icon: "✦", title: "Rooftop Terrace",   desc: "Panoramic views at golden hour, with curated cocktails and live jazz." },
  { icon: "✦", title: "Concierge Service", desc: "Your every wish anticipated — 24 hours a day, every day of the year." },
];

const STATS = [
  { value: "48",  label: "Luxury Suites"       },
  { value: "12",  label: "Years of Excellence"  },
  { value: "98%", label: "Guest Satisfaction"   },
  { value: "5★",  label: "Forbes Rated"         },
];

export default function LandingPage() {
  const [rooms,   setRooms]   = useState<Room[]>([]);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);
    fetch(`${API_BASE_URL}rooms/`)
      .then((r) => r.json())
      .then((d) => setRooms((d.results ?? d).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div style={{ background: "#0c0a09", minHeight: "100vh" }}>

      {/* ════ HERO ════ */}
      <section style={{ position: "relative", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, #1a1208 0%, #0c0a09 40%, #0f0c07 100%)" }} />
        <div style={{ position: "absolute", top: "15%", right: "8%",  width: 320, height: 320, border: "1px solid rgba(201,168,76,0.12)", transform: "rotate(15deg)" }} />
        <div style={{ position: "absolute", top: "18%", right: "10%", width: 260, height: 260, border: "1px solid rgba(201,168,76,0.08)", transform: "rotate(30deg)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "5%", width: 200, height: 200, border: "1px solid rgba(201,168,76,0.06)", transform: "rotate(-20deg)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 800, height: 800, background: "radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 40px", maxWidth: 900 }}>
          <div style={{
            height: 1,
            background: "linear-gradient(90deg, transparent, #c9a84c, transparent)",
            marginBottom: 40,
            width: visible ? "100%" : "0",
            transition: "width 1.2s ease",
          }} />

          <div className="section-label" style={{ justifyContent: "center", marginBottom: 32, opacity: visible ? 1 : 0, transition: "opacity 0.8s ease 0.3s" }}>
            Est. 2012 · Luxury Redefined
          </div>

          <h1 className="display-heading" style={{
            fontSize: "clamp(52px, 8vw, 96px)", marginBottom: 28,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.9s ease 0.5s",
          }}>
            Where Luxury<br />
            <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Becomes</em> Legend
          </h1>

          <p style={{
            fontFamily: "'Jost', sans-serif", fontSize: 16, fontWeight: 300,
            color: "rgba(245,240,232,0.6)", lineHeight: 1.9, maxWidth: 560,
            margin: "0 auto 52px",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.9s ease 0.7s",
          }}>
            An intimate sanctuary of refined elegance, where every whisper of gold and shadow tells a story of uncompromising luxury.
          </p>

          <div style={{ display: "flex", gap: 16, justifyContent: "center", opacity: visible ? 1 : 0, transition: "opacity 0.9s ease 0.9s" }}>
            <Link href="/website/rooms" className="btn-gold">Explore Rooms</Link>
            <Link href="/website/about" className="btn-outline">Our Story</Link>
          </div>

          <div style={{ position: "absolute", bottom: -120, left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
            <div style={{ fontFamily: "'Jost'", fontSize: 10, letterSpacing: "0.3em", textTransform: "uppercase", color: "#c9a84c" }}>Scroll</div>
            <div style={{ width: 1, height: 48, background: "linear-gradient(to bottom, #c9a84c, transparent)" }} />
          </div>
        </div>
      </section>

      {/* ════ STATS ════ */}
      <section style={{ borderTop: "1px solid rgba(201,168,76,0.1)", borderBottom: "1px solid rgba(201,168,76,0.1)", padding: "48px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)" }}>
          {STATS.map((s, i) => (
            <div key={s.label} style={{ textAlign: "center", padding: "0 40px", borderRight: i < 3 ? "1px solid rgba(201,168,76,0.1)" : "none" }}>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 52, fontWeight: 300, color: "#c9a84c", lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontFamily: "'Jost'", fontSize: 11, fontWeight: 400, color: "rgba(245,240,232,0.45)", letterSpacing: "0.2em", textTransform: "uppercase", marginTop: 10 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ════ ROOMS PREVIEW ════ */}
      <section style={{ padding: "120px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="section-label" style={{ justifyContent: "center", marginBottom: 24 }}>Our Accommodations</div>
            <h2 className="display-heading" style={{ fontSize: "clamp(36px, 5vw, 60px)" }}>Rooms & Suites</h2>
            <div className="gold-divider" style={{ marginTop: 28 }} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 2 }}>
            {(rooms.length > 0 ? rooms : Array(3).fill(null)).map((room, i) => (
              <div key={i} className="room-card" style={{ position: "relative", overflow: "hidden", background: "#13110e", cursor: "pointer" }}>
                <div style={{ height: 320, overflow: "hidden", background: "#1a1714", position: "relative" }}>
                  {room?.image_url ? (
                    <img src={room.image_url} alt={`Room ${room.room_number}`} className="room-img" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #1a1410, #0f0c08)" }}>
                      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 64, color: "rgba(201,168,76,0.15)" }}>{["I","II","III"][i]}</div>
                    </div>
                  )}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(12,10,9,0.9) 0%, transparent 50%)" }} />
                  {room && (
                    <div style={{ position: "absolute", top: 20, left: 20, fontFamily: "'Jost'", fontSize: 10, fontWeight: 500, letterSpacing: "0.2em", textTransform: "uppercase", color: "#c9a84c", border: "1px solid rgba(201,168,76,0.4)", padding: "5px 12px" }}>
                      {room.type}
                    </div>
                  )}
                </div>

                <div style={{ padding: "28px 28px 32px" }}>
                  {room ? (
                    <>
                      <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 24, fontWeight: 400, color: "#f5f0e8", marginBottom: 8 }}>Room {room.room_number}</div>
                      <p style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.45)", lineHeight: 1.7, marginBottom: 20, minHeight: 40 }}>
                        {room.description || `Elegant ${room.type.toLowerCase()} room on floor ${room.floor}.`}
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 28, fontWeight: 400, color: "#c9a84c" }}>₱{parseFloat(room.price_per_night).toLocaleString()}</span>
                          <span style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.35)", marginLeft: 6 }}>/night</span>
                        </div>
                        <Link href={`/website/rooms/${room.room_id}`} className="btn-gold" style={{ fontSize: 10, padding: "10px 20px" }}>View Room</Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ height: 24, width: "60%", background: "rgba(245,240,232,0.06)", borderRadius: 2, marginBottom: 12 }} />
                      <div style={{ height: 14, width: "80%", background: "rgba(245,240,232,0.04)", borderRadius: 2, marginBottom: 6 }} />
                      <div style={{ height: 14, width: "70%", background: "rgba(245,240,232,0.04)", borderRadius: 2 }} />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 52 }}>
            <Link href="/website/rooms" className="btn-outline">View All Accommodations</Link>
          </div>
        </div>
      </section>

      {/* ════ AMENITIES ════ */}
      <section style={{ padding: "100px 60px", background: "#080706", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
            <div>
              <div className="section-label" style={{ marginBottom: 24 }}>The Aurum Experience</div>
              <h2 className="display-heading" style={{ fontSize: "clamp(32px, 4vw, 52px)", marginBottom: 24 }}>
                Every Comfort,<br /><em style={{ color: "#c9a84c" }}>Artfully Considered</em>
              </h2>
              <p style={{ fontFamily: "'Jost'", fontSize: 14, fontWeight: 300, color: "rgba(245,240,232,0.5)", lineHeight: 1.9, marginBottom: 40, maxWidth: 440 }}>
                From the moment you arrive, our team anticipates your every desire. Aurum Grand Hotel is not merely a destination — it is a philosophy of living beautifully.
              </p>
              <Link href="/website/about" className="btn-gold">Discover More</Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
              {AMENITIES.map((a, i) => (
                <div key={i} style={{ padding: "32px 28px", background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.08)", transition: "border-color 0.3s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.25)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.08)")}
                >
                  <div style={{ color: "#c9a84c", fontSize: 14, marginBottom: 14 }}>{a.icon}</div>
                  <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 18, fontWeight: 400, color: "#f5f0e8", marginBottom: 10 }}>{a.title}</div>
                  <p style={{ fontFamily: "'Jost'", fontSize: 12, fontWeight: 300, color: "rgba(245,240,232,0.4)", lineHeight: 1.7 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════ CTA ════ */}
      <section style={{ padding: "100px 60px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(201,168,76,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div className="gold-divider" style={{ marginBottom: 40 }} />
          <h2 className="display-heading" style={{ fontSize: "clamp(32px, 4vw, 56px)", marginBottom: 20 }}>Begin Your Story at Aurum</h2>
          <p style={{ fontFamily: "'Jost'", fontSize: 14, fontWeight: 300, color: "rgba(245,240,232,0.5)", marginBottom: 48 }}>Reserve your suite today and step into a world apart.</p>
          <Link href="/website/rooms" className="btn-gold">Reserve Now</Link>
        </div>
      </section>
    </div>
  );
}