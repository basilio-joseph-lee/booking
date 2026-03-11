"use client"

import { useEffect, useState } from "react"
import { getUsers, deleteUser } from "@/services/userService"
import { User } from "@/types/user"
import CreateUserModal from "@/components/CreateUserModal"

export default function UsersPage() {

  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<User | null>(null)  // ← tracks who is being edited

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  async function fetchUsers() {
    const data = await getUsers()
    setUsers(data)
    setLoading(false)
  }

  async function handleDelete(id: number) {
    await deleteUser(id)
    fetchUsers()
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  if (loading) return (
    <div className="flex justify-center p-10">
      <span className="loading loading-spinner loading-lg"></span>
    </div>
  )

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-center text-2xl font-bold mb-4">User List</h1>
      <div className="border border-gray-300 my-2"></div>

      <CreateUserModal
        onSuccess={fetchUsers}
        editUser={editUser}        // ← pass selected user
      />

      <table className="table table-zebra w-[90vw] border border-gray-300 my-5">
        <thead>
          <tr>
            <th>UserID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Role</th>
            <th>Avatar URL</th>
            <th>IsActive</th>
            <th>create_at</th>
            <th>updated_at</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>*******</td>
              <td>{user.role}</td>
              <td>*******</td>
              <td>{user.is_active ? 'Active' : 'InActive'}</td>
              <td>{formatDate(user.created_at)}</td>
              <td>{formatDate(user.updated_at)}</td>
              <td>
                {/* ← sets editUser then opens modal */}
                <label
                  htmlFor="user_modal"
                  className="btn btn-secondary"
                  onClick={() => setEditUser(user)}
                >
                  Edit
                </label>
                <button
                  className="btn btn-error ml-2"
                  onClick={() => handleDelete(user.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}