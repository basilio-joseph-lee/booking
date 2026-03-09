"use client"

import { useState } from "react"
import { createUser } from "@/services/userService"
import { useRouter } from "next/navigation"

export default function CreateUserModal() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "" })

  async function handleCreate() {
    await createUser(form)
    setForm({ name: "", email: "", password: "" })
    const modal = document.getElementById("create_modal") as HTMLDialogElement
    modal.close()
    router.refresh()
  }

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => (document.getElementById("create_modal") as HTMLDialogElement).showModal()}
      >
        Add User
      </button>

      <dialog id="create_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg mb-4">Create User</h3>

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
              placeholder="Enter password"
              className="input input-bordered w-full"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="modal-action">
            <button className="btn btn-primary" onClick={handleCreate}>
              Create
            </button>
            <form method="dialog">
              <button className="btn">Cancel</button>
            </form>
          </div>
        </div>
      </dialog>
    </>
  )
}