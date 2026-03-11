"use client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getJson } from "@/lib/api";

export default function MembersPage() {
  const { data } = useQuery({ queryKey: ["members"], queryFn: () => getJson<{ items: Array<{ id: string; name: string; email: string; role: string }> }>("/app/api/members") });
  return <Card title="成员列表">{data?.items.map((m)=><p className="mb-2 text-sm" key={m.id}>{m.name} · {m.email} · {m.role}</p>)}</Card>;
}
