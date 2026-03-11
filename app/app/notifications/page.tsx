"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getJson, patchJson } from "@/lib/api";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"all" | "unread" | "read">("all");
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: () => getJson<{ items: Array<{ id: string; title: string; read: boolean; targetType: string; targetId: string }> }>("/app/api/notifications") });

  const items = (data?.items || []).filter((n) => (tab === "all" ? true : tab === "read" ? n.read : !n.read));

  return (
    <Card title="通知与消息中心" extra={<div className="flex gap-2">{(["all", "unread", "read"] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-md px-2 py-1 text-xs ${tab === t ? "bg-slate-900 text-white" : "bg-slate-100"}`}>{t}</button>)}</div>}>
      {items.map((n) => (
        <div key={n.id} className={`mb-2 rounded-lg border p-2 text-sm ${n.read ? "bg-white" : "bg-blue-50 border-blue-100"}`}>
          <div className="flex items-center justify-between"><Link href={n.targetType === "project" ? `/app/projects/${n.targetId}` : `/app/tasks?focus=${n.targetId}`}>{n.title}</Link>{!n.read && <button className="text-xs text-blue-600" onClick={async () => { await patchJson("/app/api/notifications", { id: n.id }); qc.invalidateQueries({ queryKey: ["notifications"] }); }}>标记已读</button>}</div>
        </div>
      ))}
      {!items.length && <p className="text-sm text-slate-500">当前筛选下暂无通知</p>}
    </Card>
  );
}
