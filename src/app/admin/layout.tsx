"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ToastProvider } from "@/hooks/useToast";
import { logout } from "@/services/authServices";
import { useRouter } from "next/router";

const navItems = [
  { label: "Dashboard",    href: "/admin/dashboard",    icon: "⊞" },
  { label: "Appointments", href: "/admin/appointments", icon: "📅" },
  { label: "Rooms",        href: "/admin/rooms",        icon: "🛏" },
  {
    label: "Bookings",
    href: "/admin/bookings",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01"/>
      </svg>
    ),
  },
  { label: "Sales",        href: "/admin/sales",        icon: "📊" },
  {
    label: "Transactions",
    href: "/admin/transactions",
    icon: (
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  { label: "Users",        href: "/admin/users",        icon: "👥" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();        
  function handleLogout() {            
    logout();
    router.push("/login");
  }
  return (
    <ToastProvider>
      <div
        style={{
          display: "flex",
          minHeight: "100vh",
          fontFamily: "'DM Sans', sans-serif",
          background: "#f8fafc",
        }}
      >
        {/* ── Sidebar ── */}
        <aside
          style={{
            width: 220,
            minHeight: "100vh",
            background: "#fff",
            borderRight: "1px solid #e5e7eb",
            padding: "32px 0",
            display: "flex",
            flexDirection: "column",
            position: "fixed",
            top: 0,
            left: 0,
            zIndex: 50,
          }}
        >
          {/* Logo & Title */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              paddingBottom: 24,
              borderBottom: "1px solid #f3f4f6",
              marginBottom: 8,
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Booking.com_Icon_2022.svg"
              width={52}
              height={52}
              alt="Logo"
              style={{ borderRadius: 12 }}
            />
            <span style={{ fontWeight: 800, fontSize: 15, color: "#111827", letterSpacing: 0.3 }}>
              Admin Panel
            </span>
          </div>

          {/* Nav Items */}
          <nav style={{ display: "flex", flexDirection: "column", padding: "8px 16px", gap: 4 }}>
            {navItems.map(({ label, href, icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "11px 16px",
                    borderRadius: 10,
                    background: isActive ? "#2563eb" : "transparent",
                    color: isActive ? "#fff" : "#6b7280",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 14,
                    textDecoration: "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: 16, display: "flex", alignItems: "center" }}>{icon}</span>
                  {label}
                </Link>
              );
            })}
          </nav>
          <div style={{
            marginTop: "auto",
            padding: "16px",
            borderTop: "1px solid #f3f4f6",
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 16px",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: "#ef4444",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#fff1f2")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: 16 }}>🚪</span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main content offset by sidebar width ── */}
        <main style={{ marginLeft: 220, flex: 1, minHeight: "100vh" }}>
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}