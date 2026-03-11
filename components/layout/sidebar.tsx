"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  ["工作台", "/app"],
  ["项目", "/app/projects"],
  ["任务", "/app/tasks"],
  ["我的任务", "/app/my-tasks"],
  ["团队", "/app/teams"],
  ["成员", "/app/members"],
  ["通知", "/app/notifications"],
  ["角色权限", "/app/settings/roles"],
  ["配置中心", "/app/settings/configs"]
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-64 border-r border-slate-200 bg-white px-4 py-5">
      <p className="mb-6 text-lg font-semibold">PM Platform</p>
      <nav className="space-y-1">
        {items.map(([label, href]) => (
          <Link key={href} href={href} className={cn("block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100", pathname === href || pathname.startsWith(`${href}/`) ? "bg-slate-100 text-slate-900" : "")}>{label}</Link>
        ))}
      </nav>
    </aside>
  );
}
