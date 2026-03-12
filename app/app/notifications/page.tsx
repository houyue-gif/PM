"use client";

import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getJson, patchJson } from "@/lib/api";

export default function NotificationsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["notifications"], queryFn: () => getJson<{ items: Array<{ id: string; title: string; read: boolean; targetType: string; targetId: string }> }>("/api/notifications") });
  return <Card title="通知与消息中心">{data?.items.map((n)=><div key={n.id} className={`mb-2 rounded-lg border p-2 text-sm ${n.read ? 'bg-white' : 'bg-blue-50 border-blue-100'}`}><div className="flex items-center justify-between"><Link href={n.targetType==='project'?`/app/projects/${n.targetId}`:`/app/tasks?focus=${n.targetId}`}>{n.title}</Link>{!n.read && <button className="text-xs text-blue-600" onClick={async()=>{await patchJson('/api/notifications',{id:n.id});qc.invalidateQueries({queryKey:['notifications']});}}>标记已读</button>}</div></div>)}</Card>;
}
