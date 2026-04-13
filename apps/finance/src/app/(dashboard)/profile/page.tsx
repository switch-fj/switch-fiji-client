"use client"

import { useEffect } from "react"
import { observer } from "mobx-react-lite"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui"
import { useStore } from "@/store"
import { EnumIdentityType, EnumStaffRole } from "@/constants/mangle"

const roleLabels: Record<number, string> = {
  [EnumStaffRole.ADMIN]: "Admin",
  [EnumStaffRole.ENGINEER]: "Engineer",
}

const identityLabels: Record<number, string> = {
  [EnumIdentityType.USER]: "User",
  [EnumIdentityType.CLIENT]: "Client",
}

const ProfilePage = observer(() => {
  const { AuthStore } = useStore()

  useEffect(() => {
    if (!AuthStore.profile && !AuthStore.isLoading.profile) {
      AuthStore.fetchProfile().catch(() => {
        // Errors are handled in the store; keep UI simple here.
      })
    }
  }, [AuthStore])

  if (AuthStore.isLoading.profile && !AuthStore.profile) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        Loading profile...
      </div>
    )
  }

  if (!AuthStore.profile) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] items-center justify-center text-sm">
        Unable to load profile.
      </div>
    )
  }

  const {
    email,
    role,
    identity,
    is_email_verified,
    created_at,
    updated_at,
    uid,
  } = AuthStore.profile

  const roleLabel =
    role !== null && role !== undefined
      ? (roleLabels[role] ?? `Role ${role}`)
      : "Unassigned"
  const identityLabel = identityLabels[identity] ?? `Identity ${identity}`

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account details and verification status.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Email
            </p>
            <p className="text-sm font-medium">{email}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Role
            </p>
            <p className="text-sm font-medium">{roleLabel}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Identity
            </p>
            <p className="text-sm font-medium">{identityLabel}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Email verified
            </p>
            <p className="text-sm font-medium">
              {is_email_verified ? "Verified" : "Not verified"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              User ID
            </p>
            <p className="text-sm font-medium break-all">{uid}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Created
            </p>
            <p className="text-sm font-medium">
              {new Date(created_at).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
              Updated
            </p>
            <p className="text-sm font-medium">
              {new Date(updated_at).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
})

export default ProfilePage
