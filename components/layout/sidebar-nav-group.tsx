"use client";

import { NavItemConfig, SidebarNavItem } from "@/components/layout/sidebar-nav-item";

export function SidebarNavGroup({ title, items, pathname }: { title: string; items: NavItemConfig[]; pathname: string }) {
  return (
    <section>
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{title}</p>
      <div className="space-y-1">
        {items.map((item) => (
          <SidebarNavItem key={item.href} item={item} pathname={pathname} />
        ))}
      </div>
    </section>
  );
}
