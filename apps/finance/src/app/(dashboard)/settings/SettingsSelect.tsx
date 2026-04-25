import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui"

type Option = { value: string; label: string }

type SettingsSelectProps = {
  value: string
  onChange: (val: string) => void
  options: Option[]
  placeholder?: string
}

export default function SettingsSelect({
  value,
  onChange,
  options,
  placeholder,
}: SettingsSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="border-border w-full border bg-white font-normal">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
