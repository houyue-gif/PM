"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface NavItemConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
}

export function SidebarNavItem({ item, pathname }: { item: NavItemConfig; pathname: string }) {
  const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
        "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        active && "bg-slate-900 text-white hover:bg-slate-900 hover:text-white"
      )}
    >
      <item.icon className={cn("h-4 w-4", active ? "text-white" : "text-slate-500 group-hover:text-slate-700")} />
      <span>{item.label}</span>
    </Link>
  );
}
