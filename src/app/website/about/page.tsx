"use client";

import Link from "next/link";

const TEAM = [
  { name: "Isabelle Fontaine", role: "General Manager",   initial: "I" },
  { name: "Marco de la Vega",  role: "Head Chef",          initial: "M" },
  { name: "Sofia Reyes",       role: "Director of Spa",    initial: "S" },
  { name: "Julian Hartwell",   role: "Head of Concierge",  initial: "J" },
];

const VALUES = [
  { icon: "✦", title: "Uncompromising Quality",  desc: "From thread counts to table settings, every element is curated with exacting standards." },
  { icon: "✦", title: "Genuine Warmth",          desc: "Luxury is nothing without heart. Our people bring sincerity to every interaction." },
  { icon: "✦", title: "Sustainable Elegance",    desc: "We honour the environment as we honour our guests — with care, intention, and respect." },
  { icon: "✦", title: "Timeless Craft",          desc: "We resist trends. Aurum is built on enduring principles of beauty and excellence." },
];

export default function AboutPage() {
  return (
    <div style={{ background: "#0c0a09", minHeight: "100vh", paddingTop: 80 }}>

      {/* ── Hero ── */}
      <section style={{ padding: "100px 60px 80px", position: "relative", overflow: "hidden", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 20% 50%, rgba(201,168,76,0.05), transparent 60%)" }} />
        <div style={{ position: "absolute", right: "5%",  top: "20%", width: 300, height: 300, border: "1px solid rgba(201,168,76,0.07)", transform: "rotate(12deg)" }} />
        <div style={{ position: "absolute", right: "8%",  top: "25%", width: 220, height: 220, border: "1px solid rgba(201,168,76,0.05)", transform: "rotate(28deg)" }} />
        <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
          <div className="section-label" style={{ marginBottom: 24 }}>Our Story</div>
          <h1 className="display-heading" style={{ fontSize: "clamp(44px, 6vw, 80px)", maxWidth: 700, marginBottom: 28 }}>
            The Art of<br /><em style={{ color: "#c9a84c" }}>Extraordinary</em> Hospitality
          </h1>
          <p style={{ fontFamily: "'Jost'", fontSize: 15, fontWeight: 300, color: "rgba(245,240,232,0.5)", lineHeight: 1.9, maxWidth: 560 }}>
            Founded in 2012, Aurum Grand Hotel was born from a singular conviction: that true luxury is not about opulence alone, but about the quiet perfection of every detail.
          </p>
        </div>
      </section>

      {/* ── Story ── */}
      <section style={{ padding: "100px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div style={{ position: "relative" }}>
            <div style={{ height: 500, background: "linear-gradient(135deg, #1a1410, #0f0c08)", border: "1px solid rgba(201,168,76,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 96, color: "rgba(201,168,76,0.12)", fontStyle: "italic" }}>A</span>
            </div>
            <div style={{ position: "absolute", top: -12,    left: -12,  width: 36, height: 36, borderTop:    "2px solid #c9a84c", borderLeft:   "2px solid #c9a84c" }} />
            <div style={{ position: "absolute", bottom: -12, right: -12, width: 36, height: 36, borderBottom: "2px solid #c9a84c", borderRight:  "2px solid #c9a84c" }} />
            <div style={{ position: "absolute", bottom: 32, left: -20, background: "#0c0a09", border: "1px solid rgba(201,168,76,0.3)", padding: "20px 24px", textAlign: "center" }}>
              <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 40, color: "#c9a84c", lineHeight: 1 }}>2012</div>
              <div style={{ fontFamily: "'Jost'", fontSize: 9, letterSpacing: "0.25em", color: "rgba(245,240,232,0.4)", textTransform: "uppercase", marginTop: 4 }}>Est.</div>
            </div>
          </div>

          <div>
            <div className="section-label" style={{ marginBottom: 24 }}>A Legacy of Excellence</div>
            <h2 className="display-heading" style={{ fontSize: "clamp(28px, 3vw, 44px)", marginBottom: 28 }}>
              Crafted for Those Who<br /><em style={{ color: "#c9a84c" }}>Seek the Finest</em>
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                "Nestled in the heart of the city, Aurum was conceived as a retreat from the ordinary — a place where business and leisure guests alike could experience genuine sanctuary.",
                "Our founder, inspired by the great palace hotels of Europe, envisioned a property that married Philippine warmth with international standards of excellence. That vision has never wavered.",
                "Today, Aurum Grand Hotel stands as a testament to what is possible when passion for hospitality meets an unwillingness to compromise.",
              ].map((p, i) => (
                <p key={i} style={{ fontFamily: "'Jost'", fontSize: 14, fontWeight: 300, color: "rgba(245,240,232,0.5)", lineHeight: 1.9 }}>{p}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section style={{ padding: "80px 60px", background: "#080706", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-label" style={{ justifyContent: "center", marginBottom: 20 }}>What We Stand For</div>
            <h2 className="display-heading" style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}>Our Core Values</h2>
            <div className="gold-divider" style={{ marginTop: 24 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1 }}>
            {VALUES.map((v, i) => (
              <div key={i} style={{ padding: "40px 28px", background: "#0f0d0b", border: "1px solid rgba(201,168,76,0.08)", textAlign: "center", transition: "border-color 0.3s, background 0.3s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.25)"; (e.currentTarget as HTMLDivElement).style.background = "#13110e"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(201,168,76,0.08)"; (e.currentTarget as HTMLDivElement).style.background = "#0f0d0b"; }}
              >
                <div style={{ color: "#c9a84c", fontSize: 14, marginBottom: 20 }}>{v.icon}</div>
                <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 20, fontWeight: 400, color: "#f5f0e8", marginBottom: 14 }}>{v.title}</div>
                <p style={{ fontFamily: "'Jost'", fontSize: 12, fontWeight: 300, color: "rgba(245,240,232,0.4)", lineHeight: 1.8 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section style={{ padding: "100px 60px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div className="section-label" style={{ justifyContent: "center", marginBottom: 20 }}>The Faces Behind Aurum</div>
            <h2 className="display-heading" style={{ fontSize: "clamp(28px, 3.5vw, 48px)" }}>Our Leadership</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 2 }}>
            {TEAM.map((member) => (
              <div key={member.name} style={{ background: "#13110e", overflow: "hidden" }}>
                <div style={{ height: 220, background: "linear-gradient(135deg, #1c1710, #110e08)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                  <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 64, fontWeight: 300, color: "rgba(201,168,76,0.25)", fontStyle: "italic" }}>{member.initial}</span>
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(19,17,14,1) 0%, transparent 40%)" }} />
                </div>
                <div style={{ padding: "20px 22px 24px" }}>
                  <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 20, fontWeight: 400, color: "#f5f0e8", marginBottom: 4 }}>{member.name}</div>
                  <div style={{ fontFamily: "'Jost'", fontSize: 10, fontWeight: 500, color: "#c9a84c", letterSpacing: "0.2em", textTransform: "uppercase" }}>{member.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: "80px 60px", textAlign: "center", borderTop: "1px solid rgba(201,168,76,0.1)" }}>
        <div className="gold-divider" style={{ marginBottom: 40 }} />
        <h2 className="display-heading" style={{ fontSize: "clamp(28px, 3.5vw, 48px)", marginBottom: 20 }}>Experience Aurum for Yourself</h2>
        <p style={{ fontFamily: "'Jost'", fontSize: 14, fontWeight: 300, color: "rgba(245,240,232,0.45)", marginBottom: 40 }}>Every stay is a story waiting to be written.</p>
        <Link href="/website/rooms" className="btn-gold">Reserve Your Room</Link>
      </section>
    </div>
  );
}