"use client";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getJson } from "@/lib/api";

export default function ConfigsPage() {
  const { data } = useQuery({ queryKey: ["configs"], queryFn: () => getJson<{ statuses: string[]; priorities: string[]; labels: string[] }>("/app/api/configs") });
  return <div className="grid gap-4 md:grid-cols-3"> <Card title="状态配置">{data?.statuses.map((i)=><p key={i} className="text-sm">{i}</p>)}</Card><Card title="优先级配置">{data?.priorities.map((i)=><p key={i} className="text-sm">{i}</p>)}</Card><Card title="标签配置">{data?.labels.map((i)=><p key={i} className="text-sm">{i}</p>)}</Card></div>;
}
