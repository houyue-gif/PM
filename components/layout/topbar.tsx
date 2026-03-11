"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { getJson } from "@/lib/api";

type SearchItem = { type: string; id: string; label: string };
type RecentItem = { id: string; type: string; targetId: string; label: string };

export function Topbar() {
  const [org, setOrg] = useState("Acme Group");
  const [workspace, setWorkspace] = useState("Product Workspace");
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [recent, setRecent] = useState<RecentItem[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    getJson<{ items: RecentItem[] }>("/app/api/recent-visits").then((res) => setRecent(res.items));
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!q.trim()) return setResults([]);
      const data = await getJson<{ items: SearchItem[] }>(`/app/api/search?q=${encodeURIComponent(q)}`);
      setResults(data.items || []);
    };
    const id = setTimeout(run, 200);
    return () => clearTimeout(id);
  }, [q]);

  const showPanel = useMemo(() => q.trim().length > 0 || recent.length > 0, [q, recent]);

  return (
    <div className="relative flex items-center gap-3 border-b border-slate-200 bg-white px-6 py-3">
      <select value={org} onChange={(e) => setOrg(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600">
        <option>Acme Group</option>
        <option>Nova Studio</option>
      </select>
      <select value={workspace} onChange={(e) => setWorkspace(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600">
        <option>Product Workspace</option>
        <option>Engineering Workspace</option>
      </select>

      <div className="relative">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="全局搜索项目、任务..." className="w-[32rem]" />
        {showPanel && (
          <div className="absolute left-0 top-12 z-20 w-[32rem] rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
            {q.trim() ? (
              <>
                <p className="px-2 py-1 text-xs text-slate-500">搜索结果</p>
                {results.length ? (
                  results.map((r) => (
                    <Link key={r.id} href={r.type === "project" ? `/app/projects/${r.id}` : `/app/tasks?focus=${r.id}`} className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">
                      {r.label} <span className="text-xs text-slate-500">{r.type}</span>
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm text-slate-500">无匹配结果</p>
                )}
              </>
            ) : (
              <>
                <p className="px-2 py-1 text-xs text-slate-500">最近访问</p>
                {recent.map((r) => (
                  <Link key={r.id} href={r.type === "project" ? `/app/projects/${r.targetId}` : `/app/tasks?focus=${r.targetId}`} className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">
                    {r.label}
                  </Link>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2 text-sm">
        <Link href="/app/notifications" className="rounded-md bg-slate-100 px-3 py-1">通知</Link>
        <div className="relative">
          <button className="rounded-full bg-slate-900 px-3 py-1 text-white" onClick={() => setShowUserMenu((v) => !v)}>Lena ▾</button>
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
              <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100">个人设置</button>
              <button className="block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100">切换账号</button>
              <Link href="/login" className="block rounded-md px-3 py-2 text-sm hover:bg-slate-100">退出登录</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
