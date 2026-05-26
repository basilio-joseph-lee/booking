"use client";

import { useState } from "react";
import Link from "next/link";

const CONTACT_INFO = [
  { icon: "📍", label: "Address",      value: "1 Aurum Boulevard, BGC, Taguig City, Metro Manila" },
  { icon: "📞", label: "Reservations", value: "+63 2 8888 AURUM (28786)" },
  { icon: "✉️",  label: "Email",        value: "reservations@aurumgrandhotel.com" },
  { icon: "🕐", label: "Front Desk",   value: "Open 24 hours, 7 days a week" },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);

  function set<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
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

  return (
    <div style={{ background: "#0c0a09", minHeight: "100vh", paddingTop: 80 }}>

      {/* ── Hero ── */}
      <section style={{ padding: "80px 60px 60px", borderBottom: "1px solid rgba(201,168,76,0.1)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.04), transparent 60%)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="section-label" style={{ marginBottom: 20 }}>Get in Touch</div>
          <h1 className="display-heading" style={{ fontSize: "clamp(40px, 5vw, 68px)", marginBottom: 16 }}>
            We'd Love to<br /><em style={{ color: "#c9a84c" }}>Hear from You</em>
          </h1>
          <p style={{ fontFamily: "'Jost'", fontSize: 14, fontWeight: 300, color: "rgba(245,240,232,0.45)", maxWidth: 440, lineHeight: 1.8 }}>
            Whether you're planning a stay, an event, or simply have a question — our team is always at your service.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "80px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 80 }}>

          {/* Left — contact info */}
          <div>
            <div style={{ marginBottom: 52 }}>
              <div className="section-label" style={{ marginBottom: 32 }}>Contact Information</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {CONTACT_INFO.map(({ icon, label, value }) => (
                  <div key={label} style={{ display: "flex", gap: 20, padding: "24px 20px", background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.08)", alignItems: "flex-start" }}>
                    <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.25em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
                      <div style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.6)", lineHeight: 1.6 }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map placeholder */}
            <div style={{ height: 240, background: "linear-gradient(135deg, #1a1410, #0f0c08)", border: "1px solid rgba(201,168,76,0.1)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
              <span style={{ fontSize: 32 }}>📍</span>
              <div style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.3)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Map Placeholder</div>
              <div style={{ fontFamily: "'Jost'", fontSize: 12, color: "rgba(245,240,232,0.2)" }}>BGC, Taguig City</div>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <div className="section-label" style={{ marginBottom: 32 }}>Send a Message</div>

            {sent ? (
              <div style={{ padding: "52px 40px", background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.2)", textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 20 }}>✦</div>
                <h3 className="display-heading" style={{ fontSize: 32, marginBottom: 12, color: "#c9a84c" }}>Message Received</h3>
                <p style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.45)", lineHeight: 1.8 }}>
                  Thank you for reaching out. A member of our team will be in touch within 24 hours.
                </p>
                <button onClick={() => setSent(false)} className="btn-outline" style={{ marginTop: 28, cursor: "pointer" }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <div style={{ background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.15)", padding: "40px 36px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Full Name *</label>
                      <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
                        placeholder="Juan dela Cruz" style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                        onBlur={(e)  => (e.target.style.borderColor = "rgba(245,240,232,0.12)")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Email *</label>
                      <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                        placeholder="juan@email.com" style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                        onBlur={(e)  => (e.target.style.borderColor = "rgba(245,240,232,0.12)")}
                      />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)}
                        placeholder="+63 912 345 6789" style={inputStyle}
                        onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                        onBlur={(e)  => (e.target.style.borderColor = "rgba(245,240,232,0.12)")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Subject</label>
                      <select value={form.subject} onChange={(e) => set("subject", e.target.value)}
                        style={{ ...inputStyle, cursor: "pointer" }}
                        onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                        onBlur={(e)  => (e.target.style.borderColor = "rgba(245,240,232,0.12)")}
                      >
                        <option value="">Select a topic</option>
                        {["Reservation Inquiry","Event Planning","Spa & Wellness","Dining Reservation","General Inquiry","Other"].map((o) => (
                          <option key={o} value={o} style={{ background: "#1a1714" }}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Message *</label>
                    <textarea value={form.message} onChange={(e) => set("message", e.target.value)}
                      placeholder="How may we assist you?"
                      style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
                      onFocus={(e) => (e.target.style.borderColor = "#c9a84c")}
                      onBlur={(e)  => (e.target.style.borderColor = "rgba(245,240,232,0.12)")}
                    />
                  </div>

                  <button onClick={() => setSent(true)} className="btn-gold" style={{ textAlign: "center", cursor: "pointer" }}>
                    Send Message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}