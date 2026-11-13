"use client"

import Link from "next/link"
import { ChevronDown, Settings2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@workspace/ui"
import { SETUP_VIEWS, setupHref } from "./summary/setupViews"

/** Header menu that opens a specific System setup section directly. */
export function SetupMenu({
  siteId,
  siteName,
}: {
  siteId: string
  siteName: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-lg bg-[#024159] px-4 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 data-[state=open]:opacity-90">
          <Settings2 className="h-4 w-4" />
          System setup
          <ChevronDown className="h-4 w-4 opacity-80" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-1.5">
        <DropdownMenuLabel className="text-muted-foreground px-2 py-1.5 text-xs font-medium">
          Open a setup section
        </DropdownMenuLabel>
        {SETUP_VIEWS.map((v) => (
          <DropdownMenuItem key={v.key} asChild className="cursor-pointer">
            <Link
              href={setupHref(siteId, siteName, v.key)}
              className="flex items-start gap-3 rounded-md px-2 py-2"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#024159]/10 text-[#024159]">
                <v.icon className="h-4 w-4" />
              </span>
              <span className="flex flex-col">
                <span className="text-sm font-semibold text-[#1D1D1D]">
                  {v.label}
                </span>
                <span className="text-muted-foreground text-xs">{v.hint}</span>
              </span>
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
