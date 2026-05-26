"use client"

import { useState, useEffect } from "react"
import { createUser, updateUser } from "@/services/userService"
import { User } from "@/types/user"
import { useToast } from "@/hooks/useToast"

interface Props {
  onSuccess: () => void
  editUser?: User | null   // ← if passed = edit mode, if null = create mode
}

export default function CreateUserModal({ onSuccess, editUser }: Props) {
const toast = useToast()
  const isEditing = !!editUser  // ← true if editUser exists

  const emptyForm = {
    name: "",
    email: "",
    password: "",
    role: "guest",
    avatar_url: "",
    is_active: true,
  }

  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)

  // ← when editUser changes, fill the form with their data
  useEffect(() => {
    if (editUser) {
      setForm({
        name: editUser.name,
        email: editUser.email,
        password: "",           // never pre-fill password
        role: editUser.role,
        avatar_url: editUser.avatar_url ?? "",
        is_active: editUser.is_active,
      })
    } else {
      setForm(emptyForm)        // reset when switching back to create
    }
  }, [editUser])

  async function handleSubmit() {
    setLoading(true)
    try {
      if (isEditing) {
        await updateUser(editUser!.id, form)
        toast.success("Users Updated Successfully")  // ← edit mode
      } else {
        await createUser(form) 
        toast.success("Users Added Successfully")               // ← create mode
      }
      setForm(emptyForm)
      onSuccess()
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Open button — only shows for CREATE, Edit button is in the table */}
      {!isEditing && (
        <label htmlFor="user_modal" className="btn btn-primary">
          Add User
        </label>
      )}

      <input type="checkbox" id="user_modal" className="modal-toggle" />

      <div className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">
            {isEditing ? "Edit User" : "Create User"}  {/* ← dynamic title */}
          </h3>

          <div className="form-control mb-3">
            <label className="label">Name</label>
            <input
              type="text"
              placeholder="Enter name"
              className="input input-bordered w-full"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              className="input input-bordered w-full"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">Password</label>
            <input
              type="password"
              placeholder={isEditing ? "Leave blank to keep current" : "Enter password"}
              className="input input-bordered w-full"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">Avatar URL</label>
            <input
              type="text"
              placeholder="Enter avatar URL"
              className="input input-bordered w-full"
              value={form.avatar_url}
              onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
            />
          </div>

          <div className="form-control mb-3">
            <label className="label">Role</label>
            <select
              className="select select-bordered w-full"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          <div className="form-control mb-3">
            <label className="label cursor-pointer">
              <span className="label-text">Active</span>
              <input
                type="checkbox"
                className="checkbox checkbox-primary"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
            </label>
          </div>

          <div className="modal-action">
            <label
              htmlFor="user_modal"
              className={`btn btn-primary ${loading ? "loading" : ""}`}
              onClick={handleSubmit}
            >
              {loading ? "Saving..." : isEditing ? "Update" : "Create"}
            </label>
            <label htmlFor="user_modal" className="btn">
              Cancel
            </label>    
          </div>
        </div>
      </div>
    </>
  )
}