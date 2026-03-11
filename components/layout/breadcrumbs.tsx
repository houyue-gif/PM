"use client";

import { usePathname } from "next/navigation";

export function Breadcrumbs() {
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean).slice(1);
  return (
    <div className="mb-4 text-xs text-slate-500">
      {parts.length ? parts.join(" / ") : "dashboard"}
    </div>
  );
}
