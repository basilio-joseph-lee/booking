"use client";

import { useState, useEffect } from "react";
import { createGuest, updateGuest } from "@/services/guestService";
import { getAuthUserId } from "@/services/authServices";
import { Guest } from "@/types/guests";

interface Props {
  onSuccess: () => void;
  editGuest: Guest | null;
  isOpen:    boolean;
  onClose:   () => void;
}

export default function CreateGuestModal({ onSuccess, editGuest, isOpen, onClose }: Props) {
  const isEditing = !!editGuest;

  const emptyForm = {
    full_name: "",
    email:     "",
    phone:     "",
    id_type:   "National ID",
    id_number: "",
  };

  const [form, setForm]       = useState(emptyForm);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editGuest) {
      setForm({
        full_name: editGuest.full_name,
        email:     editGuest.email,
        phone:     editGuest.phone,
        id_type:   editGuest.id_type,
        id_number: editGuest.id_number,
      });
    } else {
      setForm(emptyForm);
    }
  }, [editGuest, isOpen]);

  async function handleSubmit() {
    setLoading(true);
    try {
      const payload = {
        ...form,
        user_id: getAuthUserId(), // ← auto-assign logged-in user's id
      };

      if (isEditing) {
        await updateGuest(editGuest!.guest_id, payload);
      } else {
        await createGuest(payload);
      }

      setForm(emptyForm);
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: "#fff", borderRadius: 16, padding: "32px 28px",
        width: "100%", maxWidth: 480, boxShadow: "0 8px 40px rgba(0,0,0,0.15)",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: "0 0 24px" }}>
          {isEditing ? "Edit Guest" : "Create Guest"}
        </h3>

        {/* Full Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Full Name</label>
          <input
            type="text"
            placeholder="Enter full name"
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
          <input
            type="email"
            placeholder="Enter email"
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phone</label>
          <input
            type="text"
            placeholder="Enter phone number"
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        {/* ID Type */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>ID Type</label>
          <select
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", background: "#fff" }}
            value={form.id_type}
            onChange={(e) => setForm({ ...form, id_type: e.target.value })}
          >
            <option value="National ID">National ID</option>
            <option value="Passport">Passport</option>
            <option value="Driver's License">Driver's License</option>
          </select>
        </div>

        {/* ID Number */}
        <div style={{ marginBottom: 28 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>ID Number</label>
          <input
            type="text"
            placeholder="Enter ID number"
            style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box" }}
            value={form.id_number}
            onChange={(e) => setForm({ ...form, id_number: e.target.value })}
          />
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ padding: "9px 20px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontSize: 13, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Saving..." : isEditing ? "Update" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}