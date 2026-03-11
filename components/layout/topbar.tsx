"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";

export function Topbar() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Array<{ type: string; id: string; label: string }>>([]);

  useEffect(() => {
    const run = async () => {
      if (!q.trim()) return setResults([]);
      const res = await fetch(`/app/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.items || []);
    };
    const id = setTimeout(run, 200);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="relative flex items-center gap-4 border-b border-slate-200 bg-white px-6 py-3">
      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="全局搜索项目或任务..." className="max-w-md" />
      {results.length > 0 && (
        <div className="absolute left-6 top-14 z-20 w-[32rem] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
          {results.map((r) => (
            <Link key={r.id} href={r.type === "project" ? `/app/projects/${r.id}` : `/app/tasks?focus=${r.id}`} className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">
              {r.label} <span className="text-xs text-slate-500">{r.type}</span>
            </Link>
          ))}
        </div>
      )}
      <div className="ml-auto flex items-center gap-3 text-sm">
        <Link href="/app/notifications" className="rounded-md bg-slate-100 px-3 py-1">通知</Link>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-white">Lena</span>
      </div>
    </div>
  );
}
