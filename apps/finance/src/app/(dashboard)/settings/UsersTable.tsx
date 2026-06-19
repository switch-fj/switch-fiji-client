import { EnumStaffRole } from "@/constants/mangle"
import type { UserModel } from "@/types/engineer"

type Props = {
  users: UserModel[]
  isLoading: boolean
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function UsersTable({ users, isLoading }: Props) {
  return (
    <div className="overflow-hidden rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-[#E8EEF2] text-left">
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Role</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold">Registered By</th>
            <th className="px-4 py-3 font-semibold">Joined</th>
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <>
              {[0, 1, 2].map((i) => (
                <tr
                  key={i}
                  className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
                >
                  {[0, 1, 2, 3, 4].map((j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-3 w-24 animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))}
            </>
          ) : users.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="text-text-1 px-4 py-8 text-center text-sm"
              >
                No users yet
              </td>
            </tr>
          ) : (
            users.map((user, i) => (
              <tr
                key={user.uid}
                className={i % 2 === 1 ? "bg-neutral-50" : "bg-white"}
              >
                <td className="px-4 py-3 font-medium">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      user.role === EnumStaffRole.ADMIN
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {user.role === EnumStaffRole.ADMIN ? "Admin" : "Engineer"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.is_email_verified ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      Pending
                    </span>
                  )}
                </td>
                <td className="text-text-1 px-4 py-3">
                  {user.registrar?.email ?? "—"}
                </td>
                <td className="text-text-1 px-4 py-3">
                  {fmtDate(user.created_at)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
