import { getUsers } from "@/services/userService"
import { User } from "@/types/user"
import CreateUserModal from "@/components/CreateUserModal"

export default async function UsersPage() {
  const users: User[] = await getUsers()

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-center text-2xl font-bold mb-4">User List</h1>
      <div className="border border-gray-300 my-2"></div>

      <CreateUserModal />

      <table className="table table-zebra w-[70vw] border border-gray-300 my-5">
        <thead>
          <tr>
            <th>UserID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.user_id}>
              <td>{user.user_id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>*******</td>
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