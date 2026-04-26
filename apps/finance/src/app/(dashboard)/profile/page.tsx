"use client"

import { useEffect, useState } from "react"
import type { ReactNode } from "react"
import { observer } from "mobx-react-lite"
import { Copy, Check, User, ShieldCheck, Server } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { useStore } from "@/store"
import { EnumIdentityType, EnumStaffRole } from "@/constants/mangle"
import { useInvoiceFormatters } from "@/hooks/useInvoiceFormatters"

const roleLabels: Record<number, string> = {
  [EnumStaffRole.ADMIN]: "Admin",
  [EnumStaffRole.ENGINEER]: "Engineer",
}

const identityLabels: Record<number, string> = {
  [EnumIdentityType.USER]: "User",
  [EnumIdentityType.CLIENT]: "Client",
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: LucideIcon
  title: string
}) {
  return (
    <div className="mb-1 flex items-center gap-2">
      <Icon className="text-muted-foreground h-4 w-4" />
      <p className="text-sm font-medium">{title}</p>
    </div>
  )
}

function ProfileRow({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="w-36 shrink-0 text-sm font-medium">{label}</span>
      <div className="text-muted-foreground flex-1 text-sm">{children}</div>
    </div>
  )
}

const ProfilePage = observer(() => {
  const { AuthStore } = useStore()
  const { fmtDateTime } = useInvoiceFormatters()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!AuthStore.profile && !AuthStore.isLoading.profile) {
      AuthStore.fetchProfile().catch(() => {})
    }
  }, [AuthStore])

  function copyUid(uid: string) {
    navigator.clipboard.writeText(uid).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

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
  const initials = email.charAt(0).toUpperCase()

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div className="mx-auto flex max-w-xs flex-col items-center gap-3 pt-20 pb-10">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-2xl font-semibold text-white">
          {initials}
        </div>
        <div className="flex flex-col items-center gap-1">
          <h1 className="text-center text-2xl font-semibold">Profile</h1>
          <p className="text-muted-foreground text-center text-sm">{email}</p>
        </div>
        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
          {roleLabel}
        </span>
      </div>

      <div className="rounded-none p-8 shadow-none">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          <div className="border-r pr-10">
            <div className="flex flex-col gap-5">
              <SectionHeader icon={User} title="Account" />
              <ProfileRow label="Email">{email}</ProfileRow>
              <ProfileRow label="Role">{roleLabel}</ProfileRow>
              <ProfileRow label="Identity">{identityLabel}</ProfileRow>
            </div>
          </div>

          <div className="border-r pr-10">
            <div className="flex flex-col gap-5">
              <SectionHeader icon={ShieldCheck} title="Verification" />
              <ProfileRow label="Email status">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    is_email_verified
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {is_email_verified ? "Verified" : "Not verified"}
                </span>
              </ProfileRow>
            </div>
          </div>

          <div>
            <div className="flex flex-col gap-5">
              <SectionHeader icon={Server} title="System" />
              <ProfileRow label="User ID">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs break-all">{uid}</span>
                  <button
                    type="button"
                    onClick={() => copyUid(uid)}
                    className="text-muted-foreground hover:text-foreground shrink-0 transition-colors"
                    aria-label="Copy user ID"
                  >
                    {copied ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </ProfileRow>
              <ProfileRow label="Created">{fmtDateTime(created_at)}</ProfileRow>
              <ProfileRow label="Updated">{fmtDateTime(updated_at)}</ProfileRow>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ProfilePage
