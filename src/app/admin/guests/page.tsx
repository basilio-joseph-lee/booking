"use client";

import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "@/services/userService";
import { getGuests, deleteGuest } from "@/services/guestService";
import { User } from "@/types/user";
import { Guest } from "@/types/guests";
import { useToast } from "@/hooks/useToast";
import CreateUserModal from "@/components/CreateUserModal";
import CreateGuestModal from "@/components/CreateGuestModal";

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });

const roleColors: Record<string, { bg: string; color: string }> = {
  Admin:        { bg: "#ede9fe", color: "#6d28d9" },
  Manager:      { bg: "#dbeafe", color: "#1d4ed8" },
  Staff:        { bg: "#f0fdf4", color: "#15803d" },
  Receptionist: { bg: "#fff7ed", color: "#c2410c" },
};

const idTypeBadge: Record<string, { bg: string; color: string }> = {
  "National ID":        { bg: "#dbeafe", color: "#1d4ed8" },
  "Passport":           { bg: "#f0fdf4", color: "#15803d" },
  "Driver's License":   { bg: "#fff7ed", color: "#c2410c" },
};

export default function UsersPage() {
  const toast = useToast();

  const [subTab, setSubTab]       = useState<"guests" | "users">("guests");

  // ── Users state ──
  const [users, setUsers]         = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [editUser, setEditUser]   = useState<User | null>(null);

  // map id → name for guest table lookup
  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  // ── Guests state ──
  const [guests, setGuests]       = useState<Guest[]>([]);
  const [guestsLoading, setGuestsLoading] = useState(true);
  const [editGuest, setEditGuest] = useState<Guest | null>(null);
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  async function fetchUsers() {
    const data = await getUsers();
    setUsers(data);
    setUsersLoading(false);
  }

  async function fetchGuests() {
    try {
      const data = await getGuests();
      setGuests(data);
    } catch {
      toast.error("Failed to load guests", { message: "Could not fetch guest list." });
    } finally {
      setGuestsLoading(false);
    }
  }

  useEffect(() => {
    fetchUsers();
    fetchGuests();
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  async function handleDeleteUser(id: number) {
    try {
      await deleteUser(id);
      await fetchUsers();
      toast.success("User deleted", { message: "The user has been removed successfully." });
    } catch {
      toast.error("Failed to delete", { message: "Something went wrong. Please try again." });
    }
  }

  async function handleDeleteGuest(id: number) {
    try {
      await deleteGuest(id);
      await fetchGuests();
      toast.success("Guest deleted", { message: "The guest has been removed successfully." });
    } catch {
      toast.error("Failed to delete", { message: "Something went wrong. Please try again." });
    }
  }

  return (
    <div style={{ padding: "36px 40px", overflowY: "auto", fontFamily: "'DM Sans', sans-serif" }}>

      {/* Page Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0 }}>Users</h1>
        <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 4 }}>
          Welcome back, Admin ·{" "}
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Card */}
      <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>

        {/* DaisyUI tabs-border style */}
        <div role="tablist" style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb" }}>
          {(["guests", "users"] as const).map((key) => {
            const isActive = subTab === key;
            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setSubTab(key)}
                style={{
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#2563eb" : "#6b7280",
                  background: "transparent",
                  border: "1px solid transparent",
                  borderBottom: isActive ? "2px solid #2563eb" : "1px solid transparent",
                  marginBottom: isActive ? "-1px" : "0",
                  cursor: "pointer",
                  borderRadius: "6px 6px 0 0",
                  transition: "all 0.15s ease",
                  outline: "none",
                  textTransform: "capitalize",
                }}
              >
                {key}
              </button>
            );
          })}

          {/* Create button pushed right */}
          <div style={{ flex: 1 }} />
          <div style={{ paddingBottom: 8, display: "flex", alignItems: "center" }}>
            {subTab === "users" ? (
              <CreateUserModal onSuccess={fetchUsers} editUser={editUser} />
            ) : (
              <button
                onClick={() => { setEditGuest(null); setIsGuestModalOpen(true); }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", background: "#2563eb", color: "#fff",
                  border: "none", borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: "pointer",
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Create Guest
              </button>
            )}
          </div>
        </div>

        {/* Tab content panel */}
        <div style={{ border: "1px solid #e5e7eb", borderTop: "none", borderRadius: "0 0 10px 10px", minHeight: 220 }}>

          {/* ── Guests Tab ── */}
          {subTab === "guests" && (
            guestsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "48px 24px" }}>
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : guests.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "64px 24px", gap: 12 }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#9ca3af" }}>No guests yet</span>
                <span style={{ fontSize: 13, color: "#d1d5db" }}>Guest records will appear here</span>
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                      {["Guest ID", "Full Name", "Email", "Phone", "ID Type", "ID Number", "Assigned To", "Created At", "Actions"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#6b7280", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {guests.map((guest, i) => {
                      const badgeStyle = idTypeBadge[guest.id_type] ?? { bg: "#f3f4f6", color: "#374151" };
                      return (
                        <tr
                          key={guest.guest_id}
                          style={{ borderBottom: i < guests.length - 1 ? "1px solid #f3f4f6" : "none", transition: "background 0.1s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "14px 12px", color: "#9ca3af", fontWeight: 600 }}>#{guest.guest_id}</td>
                          <td style={{ padding: "14px 12px", fontWeight: 700, color: "#111827" }}>{guest.full_name}</td>
                          <td style={{ padding: "14px 12px", color: "#6b7280" }}>{guest.email}</td>
                          <td style={{ padding: "14px 12px", color: "#6b7280" }}>{guest.phone}</td>
                          <td style={{ padding: "14px 12px" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: badgeStyle.bg, color: badgeStyle.color, whiteSpace: "nowrap" }}>
                              {guest.id_type}
                            </span>
                          </td>
                          <td style={{ padding: "14px 12px", color: "#6b7280" }}>{guest.id_number}</td>
                          <td style={{ padding: "14px 12px", color: "#6b7280" }}>
                            {guest.user_id ?? <span style={{ color: "#d1d5db" }}>—</span>}
                          </td>
                          <td style={{ padding: "14px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{formatDate(guest.created_at)}</td>
                          <td style={{ padding: "14px 12px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <label
                                htmlFor="guest_modal"
                                onClick={() => setEditGuest(guest)}
                                style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                              >
                                Edit
                              </label>
                              <button
                                onClick={() => handleDeleteGuest(guest.guest_id)}
                                style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

          {/* ── Users Tab ── */}
          {subTab === "users" && (
            usersLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: "48px 24px" }}>
                <span className="loading loading-spinner loading-lg" />
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                      {["User ID", "Name", "Email", "Password", "Role", "Avatar URL", "Status", "Created At", "Updated At", "Actions"].map((h) => (
                        <th key={h} style={{ textAlign: "left", padding: "10px 12px", color: "#6b7280", fontWeight: 600, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, i) => {
                      const roleStyle = roleColors[user.role] ?? { bg: "#f3f4f6", color: "#374151" };
                      return (
                        <tr
                          key={user.id}
                          style={{ borderBottom: i < users.length - 1 ? "1px solid #f3f4f6" : "none", transition: "background 0.1s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td style={{ padding: "14px 12px", color: "#9ca3af", fontWeight: 600 }}>#{user.id}</td>
                          <td style={{ padding: "14px 12px", fontWeight: 700, color: "#111827" }}>{user.name}</td>
                          <td style={{ padding: "14px 12px", color: "#6b7280" }}>{user.email}</td>
                          <td style={{ padding: "14px 12px", color: "#9ca3af", letterSpacing: 2 }}>•••••••</td>
                          <td style={{ padding: "14px 12px" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: roleStyle.bg, color: roleStyle.color }}>
                              {user.role}
                            </span>
                          </td>
                          <td style={{ padding: "14px 12px", color: "#9ca3af", letterSpacing: 2 }}>•••••••</td>
                          <td style={{ padding: "14px 12px" }}>
                            <span style={{ fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: user.is_active ? "#dcfce7" : "#fee2e2", color: user.is_active ? "#16a34a" : "#dc2626" }}>
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td style={{ padding: "14px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{formatDate(user.created_at)}</td>
                          <td style={{ padding: "14px 12px", color: "#6b7280", whiteSpace: "nowrap" }}>{formatDate(user.updated_at)}</td>
                          <td style={{ padding: "14px 12px" }}>
                            <div style={{ display: "flex", gap: 6 }}>
                              <label
                                htmlFor="user_modal"
                                onClick={() => setEditUser(user)}
                                style={{ padding: "5px 12px", borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                              >
                                Edit
                              </label>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )
          )}

        </div>
      </div>

      <CreateGuestModal
        isOpen={isGuestModalOpen}
        onClose={() => { setIsGuestModalOpen(false); setEditGuest(null); }}
        editGuest={editGuest}
        onSuccess={() => {
          fetchGuests();
          toast.success(
            editGuest ? "Guest updated" : "Guest created",
            { message: editGuest ? `${editGuest.full_name} has been updated.` : "New guest has been added." }
          );
        }}
      />

    </div>
  );
}