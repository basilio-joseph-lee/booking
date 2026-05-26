"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getAuthUser, logout } from "@/services/authServices";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [user,      setUser]      = useState<any>(null);
  const [dropOpen,  setDropOpen]  = useState(false);
  const pathname   = usePathname();
  const router     = useRouter();
  const isAccount  = pathname === "/website/account";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Re-read auth on every pathname change (after login/logout)
  useEffect(() => {
    setUser(getAuthUser());
  }, [pathname]);

  function handleLogout() {
    logout();
    setUser(null);
    setDropOpen(false);
    router.push("/website");
  }

  const navLinks = [
    { href: "/website",         label: "Home"    },
    { href: "/website/rooms",   label: "Rooms"   },
    { href: "/website/about",   label: "About"   },
    { href: "/website/contact", label: "Contact" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0c0a09; color: #f5f0e8; font-family: 'Jost', sans-serif; }
        ::selection { background: #c9a84c33; color: #c9a84c; }

        body::before {
          content: ''; position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 9999; opacity: 0.35;
        }

        @keyframes goldLine  { from { width: 0; }              to { width: 100%; }           }
        @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes dropIn    { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }

        .gold-link {
          position: relative; color: #f5f0e8; text-decoration: none;
          font-family: 'Jost', sans-serif; font-weight: 400; font-size: 13px;
          letter-spacing: 0.15em; text-transform: uppercase; transition: color 0.3s;
        }
        .gold-link::after {
          content: ''; position: absolute; bottom: -3px; left: 0;
          width: 0; height: 1px; background: #c9a84c; transition: width 0.3s ease;
        }
        .gold-link:hover, .gold-link.active { color: #c9a84c; }
        .gold-link:hover::after, .gold-link.active::after { width: 100%; }

        .btn-gold {
          display: inline-block; padding: 14px 36px; background: #c9a84c;
          color: #0c0a09; font-family: 'Jost', sans-serif; font-weight: 600;
          font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;
          text-decoration: none; border: none; cursor: pointer;
          transition: all 0.3s; position: relative; overflow: hidden;
        }
        .btn-gold::before { content: ''; position: absolute; inset: 0; background: #fff; opacity: 0; transition: opacity 0.3s; }
        .btn-gold:hover::before { opacity: 0.1; }
        .btn-gold:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(201,168,76,0.3); }

        .btn-outline {
          display: inline-block; padding: 13px 36px; background: transparent;
          color: #f5f0e8; font-family: 'Jost', sans-serif; font-weight: 400;
          font-size: 12px; letter-spacing: 0.2em; text-transform: uppercase;
          text-decoration: none; border: 1px solid rgba(245,240,232,0.3);
          cursor: pointer; transition: all 0.3s;
        }
        .btn-outline:hover { border-color: #c9a84c; color: #c9a84c; }

        .section-label {
          font-family: 'Jost', sans-serif; font-size: 11px; font-weight: 500;
          letter-spacing: 0.3em; text-transform: uppercase; color: #c9a84c;
          display: flex; align-items: center; gap: 12px;
        }
        .section-label::before, .section-label::after {
          content: ''; flex: 1; max-width: 40px; height: 1px; background: #c9a84c;
        }

        .display-heading { font-family: 'Cormorant Garamond', serif; font-weight: 300; color: #f5f0e8; line-height: 1.1; }

        .gold-divider { width: 60px; height: 1px; background: linear-gradient(90deg, transparent, #c9a84c, transparent); margin: 0 auto; }

        .room-card { transition: transform 0.4s ease, box-shadow 0.4s ease; }
        .room-card:hover { transform: translateY(-6px); box-shadow: 0 24px 60px rgba(0,0,0,0.5); }
        .room-card:hover .room-img { transform: scale(1.05); }
        .room-img { transition: transform 0.6s ease; }

        .luxury-input {
          width: 100%; background: rgba(245,240,232,0.04);
          border: 1px solid rgba(245,240,232,0.15); color: #f5f0e8;
          font-family: 'Jost', sans-serif; font-size: 14px; font-weight: 300;
          padding: 14px 16px; outline: none; transition: border-color 0.3s;
          appearance: none; -webkit-appearance: none;
        }
        .luxury-input:focus { border-color: #c9a84c; }
        .luxury-input::placeholder { color: rgba(245,240,232,0.3); }
        .luxury-input option { background: #1a1714; color: #f5f0e8; }

        /* Account dropdown */
        .account-dropdown {
          position: absolute; top: calc(100% + 12px); right: 0;
          background: #13110e; border: 1px solid rgba(201,168,76,0.2);
          min-width: 200px; z-index: 200;
          animation: dropIn 0.2s ease forwards;
          box-shadow: 0 16px 48px rgba(0,0,0,0.6);
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0c0a09; }
        ::-webkit-scrollbar-thumb { background: #c9a84c44; border-radius: 2px; }
      `}</style>

      {/* ── NAVBAR ── */}
      {!isAccount && <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: scrolled ? "16px 60px" : "28px 60px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "rgba(12,10,9,0.95)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(201,168,76,0.15)" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        transition: "all 0.4s ease",
      }}>
        {/* Logo */}
        <Link href="/website" style={{ textDecoration: "none" }}>
          <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 400, color: "#f5f0e8", letterSpacing: "0.12em" }}>AURUM</div>
          <div style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 400, color: "#c9a84c", letterSpacing: "0.4em", textTransform: "uppercase", marginTop: 1 }}>Grand Hotel</div>
        </Link>

        {/* Nav links */}
        <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
          {navLinks.map((l) => (
            <Link key={l.href} href={l.href} className={`gold-link ${pathname === l.href ? "active" : ""}`}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Auth area */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {user ? (
            // ── Logged in ──
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setDropOpen((v) => !v)}
                style={{ display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "1px solid rgba(201,168,76,0.25)", padding: "8px 14px 8px 8px", cursor: "pointer", transition: "border-color 0.2s" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.5)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(201,168,76,0.25)")}
              >
                {/* Avatar */}
                <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", background: "#1a1410", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ fontFamily: "'Cormorant Garamond'", fontSize: 14, color: "#c9a84c" }}>{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <span style={{ fontFamily: "'Jost'", fontSize: 12, fontWeight: 400, color: "#f5f0e8", letterSpacing: "0.05em" }}>{user.name?.split(" ")[0]}</span>
                <span style={{ color: "#c9a84c", fontSize: 10, transition: "transform 0.2s", transform: dropOpen ? "rotate(180deg)" : "none" }}>▾</span>
              </button>

              {dropOpen && (
                <div className="account-dropdown" onMouseLeave={() => setDropOpen(false)}>
                  {/* User info */}
                  <div style={{ padding: "16px 18px", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
                    <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 16, color: "#f5f0e8", marginBottom: 2 }}>{user.name}</div>
                    <div style={{ fontFamily: "'Jost'", fontSize: 11, color: "rgba(245,240,232,0.35)" }}>{user.email}</div>
                  </div>

                  {/* Links */}
                  {[
                    { href: "/website/account", icon: "🏨", label: "My Bookings"    },
                    { href: "/website/account", icon: "💳", label: "Transactions"   },
                    { href: "/website/account", icon: "👤", label: "Profile"        },
                  ].map((item) => (
                    <Link key={item.label} href={item.href}
                      onClick={() => setDropOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.6)", textDecoration: "none", transition: "all 0.2s", borderBottom: "1px solid rgba(245,240,232,0.04)" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "#c9a84c"; (e.currentTarget as HTMLAnchorElement).style.background = "rgba(201,168,76,0.05)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = "rgba(245,240,232,0.6)"; (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
                    >
                      <span>{item.icon}</span> {item.label}
                    </Link>
                  ))}

                  {/* Logout */}
                  <button onClick={handleLogout}
                    style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 12, padding: "13px 18px", fontFamily: "'Jost'", fontSize: 13, fontWeight: 300, color: "rgba(248,113,113,0.7)", background: "transparent", border: "none", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.06)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(248,113,113,0.7)"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <span>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            // ── Not logged in ──
            <>
              <Link href="/login" className="gold-link" style={{ fontSize: 11, padding: "11px 20px", border: "1px solid rgba(245,240,232,0.12)" }}>
                Sign In
              </Link>
              <Link href="/website/rooms" className="btn-gold" style={{ fontSize: 11, padding: "11px 28px" }}>
                Book Now
              </Link>
            </>
          )}
        </div>
      </nav>}

      {/* ── CONTENT ── */}
      <main>{children}</main>

      {/* ── FOOTER ── */}
      {!isAccount && <footer style={{ background: "#080706", borderTop: "1px solid rgba(201,168,76,0.15)", padding: "72px 60px 40px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 60, marginBottom: 60 }}>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 300, color: "#f5f0e8", letterSpacing: "0.1em", marginBottom: 4 }}>AURUM</div>
              <div style={{ fontSize: 9, fontWeight: 400, color: "#c9a84c", letterSpacing: "0.4em", textTransform: "uppercase", marginBottom: 20 }}>Grand Hotel</div>
              <p style={{ fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.5)", lineHeight: 1.8, maxWidth: 280 }}>
                Where every detail whispers luxury. An experience crafted for those who seek the extraordinary.
              </p>
              <div style={{ display: "flex", gap: 16, marginTop: 28 }}>
                {["F", "I", "X"].map((s) => (
                  <div key={s} style={{ width: 36, height: 36, border: "1px solid rgba(201,168,76,0.25)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 11, color: "#c9a84c" }}>{s}</div>
                ))}
              </div>
            </div>

            {[
              { title: "Explore", links: [{ label: "Rooms & Suites", href: "/website/rooms" }, { label: "Dining", href: "#" }, { label: "Spa & Wellness", href: "#" }, { label: "Events", href: "#" }] },
              { title: "Hotel",   links: [{ label: "About Us", href: "/website/about" }, { label: "Gallery", href: "#" }, { label: "Careers", href: "#" }, { label: "Press", href: "#" }] },
              { title: "Support", links: [{ label: "Contact", href: "/website/contact" }, { label: "FAQ", href: "#" }, { label: "Privacy Policy", href: "#" }, { label: "Terms", href: "#" }] },
            ].map(({ title, links }) => (
              <div key={title}>
                <div style={{ fontSize: 10, fontWeight: 600, color: "#c9a84c", letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 24 }}>{title}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {links.map((l) => (
                    <Link key={l.label} href={l.href}
                      style={{ fontSize: 13, fontWeight: 300, color: "rgba(245,240,232,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "#c9a84c")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(245,240,232,0.5)")}
                    >{l.label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)", marginBottom: 32 }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <p style={{ fontSize: 12, fontWeight: 300, color: "rgba(245,240,232,0.3)" }}>© {new Date().getFullYear()} Aurum Grand Hotel. All rights reserved.</p>
            <p style={{ fontSize: 12, fontWeight: 300, color: "rgba(245,240,232,0.2)" }}>Crafted with precision</p>
          </div>
        </div>
      </footer>}
    </>
  );
}