"use client";

import { useEffect, useState } from "react";
import { Transaction, CreateTransactionPayload, UpdateTransactionPayload } from "@/types/transaction";
import { Booking } from "@/types/bookings";
import { Guest } from "@/types/guests";
import { getTransactions,createTransaction,updateTransaction,deleteTransaction } from "@/services/transactionServices";
import { getBookings } from "@/services/bookingService";
import { getGuests } from "@/services/guestService";
import { useToast } from "@/hooks/useToast";
// ─── CONSTANTS ───────────────────────────────────────────────────────────────

const CATEGORIES = ["Room Bookings", "Food & Beverage", "Laundry", "Spa", "Other"] as const;

const DEFAULT_FORM: CreateTransactionPayload = {
  booking: 0,
  guest: 0,
  category: "Room Bookings",
  amount: "",
  description: "",
  transaction_date: new Date().toISOString().split("T")[0],
  created_by: null,
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── SKELETON ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr>
      {[40, 80, 120, 100, 80, 100, 120, 60].map((w, i) => (
        <td key={i} style={{ padding: "14px 16px" }}>
          <div style={{ height: 12, width: w, borderRadius: 6, background: "#f1f5f9", animation: "pulse 1.4s ease-in-out infinite", animationDelay: `${i * 0.05}s` }} />
        </td>
      ))}
    </tr>
  );
}

// ─── MODAL ───────────────────────────────────────────────────────────────────

interface ModalProps {
  mode: "create" | "edit";
  initial: CreateTransactionPayload;
  bookings: Booking[];
  guests: Guest[];
  onClose: () => void;
  onSubmit: (data: CreateTransactionPayload) => Promise<void>;
  saving: boolean;
}

function TransactionModal({ mode, initial, bookings, guests, onClose, onSubmit, saving }: ModalProps) {
  const [form, setForm] = useState<CreateTransactionPayload>(initial);

  function set<K extends keyof CreateTransactionPayload>(key: K, val: CreateTransactionPayload[K]) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "9px 12px", borderRadius: 10, border: "1px solid #e2e8f0",
    fontSize: 13, color: "#1e293b", background: "#f8fafc", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em",
    textTransform: "uppercase", marginBottom: 5, display: "block",
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 520, padding: "32px 30px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#0f172a" }}>
            {mode === "create" ? "New Transaction" : "Edit Transaction"}
          </h2>
          <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 20px" }}>

          {/* Booking dropdown */}
          <div>
            <label style={labelStyle}>Booking</label>
            <select style={inputStyle} value={form.booking || ""} onChange={(e) => set("booking", Number(e.target.value))}>
              <option value="">Select booking…</option>
              {bookings.length === 0
                ? <option disabled>Loading…</option>
                : bookings.map((b) => (
                    <option key={String(b.booking_id)} value={b.booking_id}>
                      #{b.booking_id} — {formatDate(b.check_in_date)}
                    </option>
                  ))
              }
            </select>
          </div>

          {/* Guest dropdown */}
          <div>
            <label style={labelStyle}>Guest</label>
            <select style={inputStyle} value={form.guest || ""} onChange={(e) => set("guest", Number(e.target.value))}>
              <option value="">Select guest…</option>
              {guests.length === 0
                ? <option disabled>Loading…</option>
                : guests.map((g) => (
                    <option key={String(g.guest_id)} value={g.guest_id}>{g.full_name}</option>
                  ))
              }
            </select>
          </div>

          <div>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Amount (₱)</label>
            <input style={inputStyle} type="number" min={0} value={form.amount} onChange={(e) => set("amount", e.target.value)} placeholder="0.00" />
          </div>

          <div>
            <label style={labelStyle}>Transaction Date</label>
            <input style={inputStyle} type="date" value={form.transaction_date} onChange={(e) => set("transaction_date", e.target.value)} />
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <input style={inputStyle} type="text" value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="e.g. Paid" />
          </div>

        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ padding: "9px 20px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
          <button
            onClick={() => onSubmit(form)}
            disabled={saving}
            style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: saving ? "#94a3b8" : "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            {saving ? "Saving…" : mode === "create" ? "Create Transaction" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── DELETE CONFIRM ──────────────────────────────────────────────────────────

function DeleteConfirm({ transaction, onClose, onConfirm, deleting }: { transaction: Transaction; onClose: () => void; onConfirm: () => Promise<void>; deleting: boolean }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 400, padding: "32px 30px", boxShadow: "0 24px 60px rgba(0,0,0,0.18)", textAlign: "center" }}>
        <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#fff1f2", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#0f172a" }}>Delete Transaction #{transaction.transaction_id}?</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: "#94a3b8" }}>This action cannot be undone.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button onClick={onClose} style={{ padding: "9px 22px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 13, fontWeight: 600, color: "#64748b", cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
          <button onClick={onConfirm} disabled={deleting} style={{ padding: "9px 22px", borderRadius: 10, border: "none", background: deleting ? "#fda4af" : "#f43f5e", color: "#fff", fontSize: 13, fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {deleting ? "Deleting…" : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function TransactionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bookings, setBookings]         = useState<Booking[]>([]);
  const [guests, setGuests]             = useState<Guest[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [showCreate, setShowCreate]     = useState(false);
  const [editTarget, setEditTarget]     = useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [saving, setSaving]             = useState(false);
  const [deleting, setDeleting]         = useState(false);

  const toast = useToast();

  // ── Lookup helpers ──
  function guestName(id: number) {
    return guests.find((g) => g.guest_id === id)?.full_name ?? `Guest #${id}`;
  }
  function bookingLabel(id: number) {
    const b = bookings.find((b) => b.booking_id === id);
    return b ? `#${b.booking_id} — ${formatDate(b.check_in_date)}` : `Booking #${id}`;
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [t, b, g] = await Promise.all([getTransactions(), getBookings(), getGuests()]);
      setTransactions(t);
      setBookings(b);
      setGuests(g);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(data: CreateTransactionPayload) {
    setSaving(true);
    try {
      const created = await createTransaction(data);
      setTransactions((t) => [...t, created]);
      setShowCreate(false);
      toast.success("Transaction created successfully.");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleUpdate(data: CreateTransactionPayload) {
    if (!editTarget) return;
    setSaving(true);
    try {
      const updated = await updateTransaction(editTarget.transaction_id, data as UpdateTransactionPayload);
      setTransactions((t) => t.map((x) => (x.transaction_id === updated.transaction_id ? updated : x)));
      setEditTarget(null);
      toast.success("Transaction updated successfully.");
    } catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTransaction(deleteTarget.transaction_id);
      setTransactions((t) => t.filter((x) => x.transaction_id !== deleteTarget.transaction_id));
      setDeleteTarget(null);
      toast.success("Transaction deleted.");
    } catch (e: any) { toast.error(e.message); }
    finally { setDeleting(false); }
  }

  // ── Stats ──
  const totalRevenue = transactions.reduce((sum, t) => sum + parseFloat(t.amount || "0"), 0);
  const categoryStats = CATEGORIES.map((c) => ({
    label: c,
    count: transactions.filter((t) => t.category === c).length,
    total: transactions.filter((t) => t.category === c).reduce((s, t) => s + parseFloat(t.amount || "0"), 0),
  }));

  // ── Filter ──
  const filtered = transactions.filter((t) => {
    const gName = guestName(t.guest).toLowerCase();
    const bLabel = bookingLabel(t.booking).toLowerCase();
    const matchSearch =
      String(t.transaction_id).includes(search) ||
      gName.includes(search.toLowerCase()) ||
      bLabel.includes(search.toLowerCase()) ||
      t.description?.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || t.category === filterCategory;
    return matchSearch && matchCat;
  });

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        table { border-collapse: collapse; width: 100%; }
        thead th { position: sticky; top: 0; background: #f8fafc; z-index: 1; }
        tbody tr:hover td { background: #f8fafc; }
      `}</style>

      {/* Modals */}
      {showCreate && (
        <TransactionModal mode="create" initial={DEFAULT_FORM} bookings={bookings} guests={guests} onClose={() => setShowCreate(false)} onSubmit={handleCreate} saving={saving} />
      )}
      {editTarget && (
        <TransactionModal
          mode="edit"
          initial={{ booking: editTarget.booking, guest: editTarget.guest, category: editTarget.category, amount: editTarget.amount, description: editTarget.description, transaction_date: editTarget.transaction_date, created_by: editTarget.created_by }}
          bookings={bookings}
          guests={guests}
          onClose={() => setEditTarget(null)}
          onSubmit={handleUpdate}
          saving={saving}
        />
      )}
      {deleteTarget && <DeleteConfirm transaction={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} deleting={deleting} />}

      <div style={{ padding: "36px 40px", fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", background: "#f8fafc" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0f172a", margin: 0 }}>Transactions</h1>
            <p style={{ fontSize: 14, color: "#94a3b8", marginTop: 4 }}>
              Welcome back, Admin ·{" "}
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 12, border: "none", background: "#0f172a", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(15,23,42,0.2)" }}
          >
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Transaction
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
          {/* Total revenue card */}
          <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>Total Revenue</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#fff" }}>₱{totalRevenue.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</div>
          </div>
          {categoryStats.slice(0, 3).map(({ label, count, total }) => (
            <div key={label} style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 14, padding: "16px 18px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>₱{total.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{count} transaction{count !== 1 ? "s" : ""}</div>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, guest, booking, category, or description…"
            style={{ flex: 1, padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit" }}
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, color: "#1e293b", background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer" }}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button onClick={load} title="Refresh" style={{ padding: "9px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontSize: 14, cursor: "pointer" }}>🔄</button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fff1f2", color: "#be123c", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 13, fontWeight: 500 }}>
            Failed to load: {error}
          </div>
        )}

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #f1f5f9", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div style={{ overflowX: "auto" }}>
            <table>
              <thead>
                <tr>
                  {["ID", "Booking", "Guest", "Category", "Amount", "Description", "Date", ""].map((h) => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.06em", textTransform: "uppercase", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : filtered.map((t) => (
                      <tr key={t.transaction_id} style={{ borderBottom: "1px solid #f8fafc" }}>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#0f172a" }}>#{t.transaction_id}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{bookingLabel(t.booking)}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{guestName(t.guest)}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "#f1f5f9", color: "#475569" }}>
                            {t.category}
                          </span>
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 700, color: "#0f172a", whiteSpace: "nowrap" }}>₱{parseFloat(t.amount).toLocaleString()}</td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: "#94a3b8" }}>{t.description || "—"}</td>
                        <td style={{ padding: "14px 16px", fontSize: 13, color: "#475569", whiteSpace: "nowrap" }}>{formatDate(t.transaction_date)}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button
                              onClick={() => setEditTarget(t)}
                              title="Edit"
                              style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #e2e8f0", background: "#f8fafc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(t)}
                              title="Delete"
                              style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #fecdd3", background: "#fff1f2", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Empty */}
          {!loading && !error && filtered.length === 0 && (
            <div style={{ textAlign: "center", color: "#94a3b8", padding: "48px 0", fontSize: 14 }}>
              {search || filterCategory !== "All" ? "No transactions match your search." : "No transactions found."}
            </div>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div style={{ padding: "12px 16px", borderTop: "1px solid #f1f5f9", fontSize: 12, color: "#94a3b8", display: "flex", justifyContent: "space-between" }}>
              <span>Showing {filtered.length} of {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</span>
              <span style={{ fontWeight: 700, color: "#0f172a" }}>
                Filtered total: ₱{filtered.reduce((s, t) => s + parseFloat(t.amount || "0"), 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}