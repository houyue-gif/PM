"use client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getJson } from "@/lib/api";

export default function TeamsPage() {
  const { data } = useQuery({ queryKey: ["teams"], queryFn: () => getJson<{ items: Array<{ id: string; name: string; memberIds: string[] }> }>("/app/api/teams") });
  return <Card title="团队列表">{data?.items.map((t)=><p className="mb-2 text-sm" key={t.id}>{t.name} · {t.memberIds.length} 人</p>)}<button className="mt-2 rounded-md bg-slate-100 px-3 py-1 text-sm">邀请成员</button></Card>;
}
