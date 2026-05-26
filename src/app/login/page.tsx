"use client";

import { useState } from "react";
import { loginAuthentication } from "@/services/authServices";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router   = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleLogin() {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      const res = await loginAuthentication({ email, password });
      // Redirect admin/staff to admin, guests to account dashboard
      const role = res.user?.role;
      if (role === "admin" || role === "staff") {
        router.push("/admin/dashboard");
      } else {
        router.push("/website/account");
      }
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #0c0a09; color: #f5f0e8; font-family: 'Jost', sans-serif; }
        ::selection { background: #c9a84c33; color: #c9a84c; }

        body::before {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.35;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes goldPulse {
          0%, 100% { opacity: 0.4; }
          50%       { opacity: 0.8; }
        }

        .auth-input {
          width: 100%;
          background: rgba(245,240,232,0.04);
          border: 1px solid rgba(245,240,232,0.12);
          color: #f5f0e8;
          font-family: 'Jost', sans-serif;
          font-size: 14px; font-weight: 300;
          padding: 15px 18px;
          outline: none;
          transition: border-color 0.3s, background 0.3s;
          letter-spacing: 0.02em;
        }
        .auth-input:focus {
          border-color: #c9a84c;
          background: rgba(201,168,76,0.04);
        }
        .auth-input::placeholder { color: rgba(245,240,232,0.25); }

        .btn-gold {
          width: 100%; padding: 15px;
          background: #c9a84c; color: #0c0a09;
          font-family: 'Jost', sans-serif;
          font-weight: 600; font-size: 12px;
          letter-spacing: 0.25em; text-transform: uppercase;
          border: none; cursor: pointer;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .btn-gold:disabled { opacity: 0.6; cursor: not-allowed; }
        .btn-gold:not(:disabled):hover { box-shadow: 0 8px 32px rgba(201,168,76,0.35); transform: translateY(-1px); }
        .btn-gold::before {
          content: ''; position: absolute; inset: 0;
          background: #fff; opacity: 0; transition: opacity 0.3s;
        }
        .btn-gold:not(:disabled):hover::before { opacity: 0.08; }
      `}</style>

      <div style={{
        minHeight: "100vh", display: "flex",
        background: "#0c0a09", position: "relative", overflow: "hidden",
      }}>
        {/* ── Left panel — decorative ── */}
        <div style={{
          flex: 1, position: "relative", overflow: "hidden",
          background: "linear-gradient(135deg, #1a1208 0%, #0c0a09 60%)",
          borderRight: "1px solid rgba(201,168,76,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {/* Geometric accents */}
          <div style={{ position: "absolute", top: "10%",  left: "10%",  width: 300, height: 300, border: "1px solid rgba(201,168,76,0.08)", transform: "rotate(15deg)" }} />
          <div style={{ position: "absolute", top: "15%",  left: "15%",  width: 220, height: 220, border: "1px solid rgba(201,168,76,0.05)", transform: "rotate(30deg)" }} />
          <div style={{ position: "absolute", bottom: "10%", right: "10%", width: 250, height: 250, border: "1px solid rgba(201,168,76,0.06)", transform: "rotate(-10deg)" }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 40% 50%, rgba(201,168,76,0.05) 0%, transparent 65%)" }} />

          {/* Brand */}
          <div style={{ position: "relative", textAlign: "center", animation: "fadeUp 0.8s ease forwards" }}>
            <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 72, fontWeight: 300, color: "#f5f0e8", letterSpacing: "0.15em", lineHeight: 1, marginBottom: 8 }}>
              AURUM
            </div>
            <div style={{ fontFamily: "'Jost'", fontSize: 10, fontWeight: 400, color: "#c9a84c", letterSpacing: "0.5em", textTransform: "uppercase", marginBottom: 48 }}>
              Grand Hotel
            </div>
            <div style={{ width: 60, height: 1, background: "linear-gradient(90deg, transparent, #c9a84c, transparent)", margin: "0 auto 40px" }} />
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontSize: 20, fontWeight: 300, color: "rgba(245,240,232,0.4)", letterSpacing: "0.05em", maxWidth: 280, lineHeight: 1.6 }}>
              "Where every detail whispers luxury."
            </p>

            {/* Animated gold dot */}
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c9a84c", margin: "48px auto 0", animation: "goldPulse 2.5s ease-in-out infinite" }} />
          </div>
        </div>

        {/* ── Right panel — form ── */}
        <div style={{
          width: 480, display: "flex", alignItems: "center", justifyContent: "center",
          padding: "60px 56px", position: "relative",
        }}>
          <div style={{ width: "100%", animation: "fadeUp 0.8s ease 0.2s both" }}>

            {/* Top gold line */}
            <div style={{ height: 1, background: "linear-gradient(90deg, #c9a84c, transparent)", marginBottom: 48 }} />

            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: "'Jost'", fontSize: 10, fontWeight: 500, color: "#c9a84c", letterSpacing: "0.35em", textTransform: "uppercase", marginBottom: 12 }}>
                Welcome Back
              </div>
              <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 40, fontWeight: 300, color: "#f5f0e8", lineHeight: 1.1, marginBottom: 10 }}>
                Sign in to your<br />
                <em style={{ color: "#c9a84c", fontStyle: "italic" }}>Account</em>
              </h1>
              <p style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.4)", lineHeight: 1.7 }}>
                Access your bookings and manage your stay with us.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: "12px 16px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 24, fontFamily: "'Jost'", fontSize: 13, color: "#f87171", letterSpacing: "0.02em" }}>
                {error}
              </div>
            )}

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
              <div>
                <label style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "rgba(245,240,232,0.35)", letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="auth-input"
                  autoFocus
                />
              </div>

              <div>
                <label style={{ fontFamily: "'Jost'", fontSize: 9, fontWeight: 600, color: "rgba(245,240,232,0.35)", letterSpacing: "0.3em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Password
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    className="auth-input"
                    style={{ paddingRight: 48 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(245,240,232,0.3)", fontSize: 12, fontFamily: "'Jost'", transition: "color 0.2s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.3)")}
                  >
                    {showPass ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button className="btn-gold" onClick={handleLogin} disabled={loading}>
              {loading ? (
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                  <span style={{ width: 14, height: 14, border: "2px solid rgba(12,10,9,0.3)", borderTopColor: "#0c0a09", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                  Signing In…
                </span>
              ) : "Sign In"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "28px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(245,240,232,0.08)" }} />
              <span style={{ fontFamily: "'Jost'", fontSize: 10, color: "rgba(245,240,232,0.25)", letterSpacing: "0.2em", textTransform: "uppercase" }}>or</span>
              <div style={{ flex: 1, height: 1, background: "rgba(245,240,232,0.08)" }} />
            </div>

            {/* Register link */}
            <div style={{ textAlign: "center" }}>
              <span style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.4)" }}>
                New to Aurum?{" "}
              </span>
              <Link href="/register" style={{ fontFamily: "'Jost'", fontSize: 13, fontWeight: 500, color: "#c9a84c", textDecoration: "none", letterSpacing: "0.05em", transition: "opacity 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                Create an Account
              </Link>
            </div>

            {/* Back to website */}
            <div style={{ textAlign: "center", marginTop: 20 }}>
              <Link href="/website" style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.2)", textDecoration: "none", letterSpacing: "0.12em", textTransform: "uppercase", transition: "color 0.2s" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.5)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.2)")}
              >
                ← Back to Website
              </Link>
            </div>

            {/* Bottom gold line */}
            <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #c9a84c)", marginTop: 48 }} />
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}