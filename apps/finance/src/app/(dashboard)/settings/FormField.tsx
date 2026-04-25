import type { ReactNode } from "react"

type FormFieldProps = {
  label: string
  error?: string
  children: ReactNode
  position?: "left" | "right" | "center"
  width?: string
}

export default function FormField({
  label,
  error,
  children,
  position = "left",
  width,
}: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-4">
        <label
          className={`${width} shrink-0 text-sm text-${position} font-medium`}
        >
          {label}
        </label>
        <div className="flex-1">{children}</div>
      </div>
      {error && <p className="text-destructive pl-40 text-xs">{error}</p>}
    </div>
  )
}
