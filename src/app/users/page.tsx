
import { getUsers } from "@/services/userService"
import { User } from "@/types/user"
import CreateUserModal from "@/components/CreateUserModal"

export default async function UsersPage() {

  // Simple utility function
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

  const users: User[] = await getUsers()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-center text-2xl font-bold mb-4">User List</h1>
      <div className="border border-gray-300 my-2"></div>

      <CreateUserModal />

      <table className="table table-zebra w-[90vw] border border-gray-300 my-5">
        <thead>
          <tr>
            <th>UserID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Role</th>
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
              <td>{user.is_active ? 'Active' : 'InActive'}</td>
              <td>{formatDate(user.created_at)}</td>
              <td>{formatDate(user.updated_at)}</td>
              <td>
                <button className="btn btn-secondary">Edit</button>
                <button className="btn btn-error ml-2">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}