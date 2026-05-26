"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/config/api";
import { loginAuthentication } from "@/services/authServices";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function set<K extends keyof typeof form>(key: K, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleRegister() {
    if (!form.name || !form.email || !form.password || !form.confirm) {
      setError("Please fill in all fields."); return;
    }
    if (form.password !== form.confirm) {
      setError("Passwords do not match."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }

    setError(""); setLoading(true);
    try {
      // Create guest user
      const res = await fetch(`${API_BASE_URL}users/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, role: "guest" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.email?.[0] || data?.name?.[0] || "Registration failed.");
      }

      // Auto-login after register
      await loginAuthentication({ email: form.email, password: form.password });
      router.push("/website/account");
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const strength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 10 ? 2
    : 3;

  const strengthLabel = ["", "Weak", "Good", "Strong"];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c55e"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c0a09; color: #f5f0e8; font-family: 'Jost', sans-serif; }
        ::selection { background: #c9a84c33; color: #c9a84c; }

        body::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.35;
        }

        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        @keyframes goldPulse { 0%,100%{opacity:.4} 50%{opacity:.8} }

        .auth-input {
          width: 100%; background: rgba(245,240,232,0.04);
          border: 1px solid rgba(245,240,232,0.12); color: #f5f0e8;
          font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 300;
          padding: 15px 18px; outline: none; transition: border-color 0.3s, background 0.3s;
        }
        .auth-input:focus { border-color: #c9a84c; background: rgba(201,168,76,0.04); }
        .auth-input::placeholder { color: rgba(245,240,232,0.25); }

        .btn-gold {
          width: 100%; padding: 15px; background: #c9a84c; color: #0c0a09;
          font-family: 'Jost', sans-serif; font-weight: 600; font-size: 12px;
          letter-spacing: 0.25em; text-transform: uppercase; border: none;
          cursor: pointer; transition: all 0.3s; position: relative; overflow: hidden;
        }
        .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-gold:not(:disabled):hover { box-shadow: 0 8px 32px rgba(201,168,76,0.35); transform: translateY(-1px); }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", background: "#0c0a09", position: "relative", overflow: "hidden" }}>

        {/* ── Left panel ── */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, #1a1208 0%, #0c0a09 60%)",
          borderRight: "1px solid rgba(201,168,76,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <div style={{ position: "absolute", top: "10%", left: "10%", width: 300, height: 300, border: "1px solid rgba(201,168,76,0.08)", transform: "rotate(15deg)" }} />
          <div style={{ position: "absolute", top: "15%", left: "15%", width: 220, height: 220, border: "1px solid rgba(201,168,76,0.05)", transform: "rotate(30deg)" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 250, height: 250, border: "1px solid rgba(201,168,76,0.06)", transform: "rotate(-10deg)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 40% 50%, rgba(201,168,76,0.05) 0%, transparent 65%)" }} />

          <div style={{ position: "relative", textAlign: "center", animation: "fadeUp 0.8s ease forwards" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, fontWeight: 300, color: "#f5f0e8", letterSpacing: "0.15em", lineHeight: 1, marginBottom: 8 }}>AURUM</div>
            <div style={{ fontFamily: "'Jost'", fontSize: 10, fontWeight: 400, color: "#c9a84c", letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: 48 }}>Grand Hotel</div>
            <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)", margin: "0 auto 40px" }} />

            {/* Perks */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20, textAlign: "left", maxWidth: 260 }}>
              {[
                { icon: "✦", text: "Track all your bookings in one place" },
                { icon: "✦", text: "Manage your guest profile easily"     },
                { icon: "✦", text: "View your full transaction history"    },
                { icon: "✦", text: "Cancel or modify reservations"         },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                  <span style={{ color: "#c9a84c", fontSize: 10, marginTop: 3, flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.5)", lineHeight: 1.6 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", margin: "40px auto 0", animation: "goldPulse 2.5s ease-in-out infinite" }} />
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div style={{ width: 480, display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 56px" }}>
          <div style={{ width: "100%", animation: "fadeUp 0.8s ease 0.2s both" }}>

            <div style={{ height: 1, background: "linear-gradient(90deg, #c9a84c, transparent)", marginBottom: 48 }} />

            <div style={{ marginBottom: 32 }}>
              <div style={{ fontFamily: "'Jost'", fontSize: 10, fontWeight: 500, color: "#c9a84c", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>
                Create Account
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "#f5f0e8", lineHeight: 1.1, marginBottom: 10 }}>
                Join<br />
                <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Aurum</em>
              </h1>
              <p style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.4)", lineHeight: 1.7 }}>
                Create a guest account to manage your bookings.
              </p>
            </div>

            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 20, fontFamily: "'Jost'", fontSize: 13, color: "#f87171" }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {/* Name */}
              <div>
                <label style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "rgba(245,240,232,0.35)", letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Full Name</label>
                <input type="text" placeholder="Juan dela Cruz" value={form.name}
                  onChange={(e) => set("name", e.target.value)} className="auth-input" autoFocus />
              </div>

              {/* Email */}
              <div>
                <label style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "rgba(245,240,232,0.35)", letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Email Address</label>
                <input type="email" placeholder="your@email.com" value={form.email}
                  onChange={(e) => set("email", e.target.value)} className="auth-input" />
              </div>

              {/* Password */}
              <div>
                <label style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "rgba(245,240,232,0.35)", letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} placeholder="Min. 8 characters" value={form.password}
                    onChange={(e) => set("password", e.target.value)} className="auth-input" style={{ paddingRight: 48 }} />
                  <button type="button" onClick={() => setShowPass((v) => !v)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.3)", fontSize: 11, fontFamily: "'Jost'", letterSpacing: "0.1em" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.3)")}
                  >{showPass ? "HIDE" : "SHOW"}</button>
                </div>
                {/* Strength bar */}
                {form.password.length > 0 && (
                  <div style={{ marginTop: 8, display: "flex", gap: 4, alignItems: "center" }}>
                    {[1,2,3].map((level) => (
                      <div key={level} style={{ flex: 1, height: 2, borderRadius: 1, background: strength >= level ? strengthColor[strength] : "rgba(245,240,232,0.08)", transition: "background 0.3s" }} />
                    ))}
                    <span style={{ fontFamily: "'Jost'", fontSize: 10, color: strengthColor[strength], marginLeft: 8, letterSpacing: "0.1em", textTransform: "uppercase" }}>{strengthLabel[strength]}</span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "rgba(245,240,232,0.35)", letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Confirm Password</label>
                <input type={showPass ? "text" : "password"} placeholder="Repeat password" value={form.confirm}
                  onChange={(e) => set("confirm", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  className="auth-input"
                  style={{ borderColor: form.confirm && form.confirm !== form.password ? "rgba(239,68,68,0.5)" : undefined }}
                />
                {form.confirm && form.confirm !== form.password && (
                  <div style={{ fontFamily: "'Jost'", fontSize: 11, color: "#f87171", marginTop: 6 }}>Passwords do not match</div>
                )}
              </div>
            </div>

            <button className="btn-gold" onClick={handleRegister} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(12,10,9,0.3)", borderTopColor: "#0c0a09", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Creating Account…
                </span>
              ) : "Create Account"}
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "24px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(245,240,232,0.08)" }} />
              <span style={{ fontFamily: "'Jost'", fontSize: 10, color: "rgba(245,240,232,0.25)", letterSpacing: "0.2em", textTransform: "uppercase" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(245,240,232,0.08)" }} />
            </div>

            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.4)" }}>Already have an account? </span>
              <Link href="/" style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 500, color: "#c9a84c", textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >Sign In</Link>
            </div>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <Link href="/website" style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.2)", textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.5)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.2)")}
              >← Back to Website</Link>
            </div>

            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #c9a84c)", marginTop: 40 }} />
          </div>
        </div>
      </div>
    </>
  );
}