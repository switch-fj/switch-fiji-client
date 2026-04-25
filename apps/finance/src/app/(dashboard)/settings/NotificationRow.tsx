import Toggle from "@/app/(dashboard)/components/Toggle"

type NotificationRowProps = {
  label: string
  checked: boolean
  onChange: (val: boolean) => void
}

export default function NotificationRow({
  label,
  checked,
  onChange,
}: NotificationRowProps) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  )
}
