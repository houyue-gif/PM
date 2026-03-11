"use client";

import { Bell, FolderKanban, Home, ShieldCheck, SlidersHorizontal, SquareKanban, Users, UsersRound, CheckSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { SidebarNavGroup } from "@/components/layout/sidebar-nav-group";
import { NavItemConfig } from "@/components/layout/sidebar-nav-item";

const collaborationItems: NavItemConfig[] = [
  { label: "工作台", href: "/app", icon: Home, exact: true },
  { label: "项目", href: "/app/projects", icon: FolderKanban },
  { label: "任务", href: "/app/tasks", icon: SquareKanban },
  { label: "我的任务", href: "/app/my-tasks", icon: CheckSquare },
  { label: "团队", href: "/app/teams", icon: UsersRound },
  { label: "成员", href: "/app/members", icon: Users },
  { label: "通知", href: "/app/notifications", icon: Bell }
];

const settingItems: NavItemConfig[] = [
  { label: "角色权限", href: "/app/settings/roles", icon: ShieldCheck },
  { label: "基础配置", href: "/app/settings/configs", icon: SlidersHorizontal }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 h-screen w-72 shrink-0 border-r border-slate-200 bg-white px-4 py-5">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="rounded-lg bg-slate-900 p-1.5 text-white">
          <FolderKanban className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">PM Platform</p>
          <p className="text-xs text-slate-500">P0 Workspace</p>
        </div>
      </div>

      <nav className="space-y-5">
        <SidebarNavGroup title="协作管理" items={collaborationItems} pathname={pathname} />
        <SidebarNavGroup title="系统设置" items={settingItems} pathname={pathname} />
      </nav>
    </aside>
  );
}
