"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { getJson } from "@/lib/api";

export default function SearchPage() {
  const params = useSearchParams();
  const q = params.get("q") || "";
  const { data, isLoading } = useQuery({ queryKey: ["search", q], queryFn: () => getJson<{ items: Array<{ type: string; id: string; label: string }> }>(`/app/api/search?q=${encodeURIComponent(q)}`), enabled: q.length > 0 });

  return (
    <Card title="全局搜索结果">
      {!q && <p className="text-sm text-slate-500">请输入关键词搜索项目或任务</p>}
      {isLoading && <p className="text-sm text-slate-500">搜索中...</p>}
      {!!q && !isLoading && !(data?.items?.length) && <p className="text-sm text-slate-500">未检索到结果</p>}
      <div className="space-y-2">
        {data?.items.map((item) => (
          <Link key={item.id} href={item.type === "project" ? `/app/projects/${item.id}` : `/app/tasks?focus=${item.id}`} className="block rounded-lg border border-slate-200 p-3 hover:bg-slate-50">
            <p className="text-sm font-medium">{item.label}</p>
            <p className="text-xs text-slate-500">{item.type}</p>
          </Link>
        ))}
      </div>
    </Card>
  );
}
