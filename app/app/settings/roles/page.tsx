"use client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getJson } from "@/lib/api";

export default function RolesPage() {
  const { data } = useQuery({ queryKey: ["roles"], queryFn: () => getJson<{ items: Array<{ id: string; name: string; permissions: string[] }> }>("/api/roles") });
  return <Card title="角色与权限">{data?.items.map((r)=><div key={r.id} className="mb-3 rounded-lg border border-slate-200 p-2"><p className="font-medium text-sm">{r.name}</p><p className="text-xs text-slate-600">{r.permissions.join(", ")}</p></div>)}</Card>;
}
