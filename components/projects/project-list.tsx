"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getJson, patchJson } from "@/lib/api";
import { Member, Project, Tag, Team } from "@/types/domain";

const viewKey = "pm_projects_view";
type DataResp = { items: Project[]; options: { members: Member[]; teams: Team[]; tags: Tag[] } };

export function ProjectList() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [phase, setPhase] = useState("all");
  const [type, setType] = useState("all");
  const [risk, setRisk] = useState("all");
  const [onlyArchived, setOnlyArchived] = useState(false);
  const [sort, setSort] = useState("updatedAt");
  const [selected, setSelected] = useState<string[]>([]);
  const [view, setView] = useState<"table" | "card">(() => (typeof window === "undefined" ? "table" : ((localStorage.getItem(viewKey) as "table" | "card") || "table")));
  const [batchOwner, setBatchOwner] = useState("u1");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const { data, isLoading, isError } = useQuery({ queryKey: ["projects", onlyArchived], queryFn: () => getJson<DataResp>(`/api/projects?archived=${onlyArchived}`) });
  const members = data?.options.members || [];
  const teams = data?.options.teams || [];

  const filtered = useMemo(() => {
    const items = (data?.items || []).filter((p) => {
      const owner = members.find((m) => m.id === p.ownerId)?.name || "";
      const hit = [p.name, p.code, owner].join(" ").toLowerCase().includes(q.toLowerCase());
      return hit && (status === "all" || p.status === status) && (phase === "all" || p.phase === phase) && (type === "all" || p.type === type) && (risk === "all" || p.riskLevel === risk);
    });
    return items.sort((a, b) => {
      if (sort === "updatedAt") return +new Date(b.updatedAt) - +new Date(a.updatedAt);
      if (sort === "createdAt") return +new Date(b.createdAt) - +new Date(a.createdAt);
      if (sort === "endDate") return +new Date(a.endDate) - +new Date(b.endDate);
      if (sort === "risk") return ["low", "medium", "high", "critical"].indexOf(b.riskLevel) - ["low", "medium", "high", "critical"].indexOf(a.riskLevel);
      return b.scheduleDelta - a.scheduleDelta;
    });
  }, [data, members, q, status, phase, type, risk, sort]);

  const runBatch = async (payload: any, success: string) => {
    try {
      setSaving(true);
      await patchJson("/api/projects", payload);
      setMsg(success);
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["projects"] });
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {msg && <div className="rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div>}
      <div className="flex items-center gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索项目名称 / 编码 / 负责人" className="max-w-sm" />
        <select className="rounded border px-2 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">状态</option><option value="draft">草稿</option><option value="active">进行中</option><option value="on_hold">暂停中</option><option value="completed">已完成</option><option value="closed">已关闭</option><option value="archived">已归档</option></select>
        <select className="rounded border px-2 py-2 text-sm" value={phase} onChange={(e) => setPhase(e.target.value)}><option value="all">阶段</option><option value="initiation">立项</option><option value="planning">规划</option><option value="execution">执行</option><option value="acceptance">验收</option><option value="retrospective">复盘</option></select>
        <select className="rounded border px-2 py-2 text-sm" value={type} onChange={(e) => setType(e.target.value)}><option value="all">类型</option><option value="product">产品</option><option value="delivery">交付</option><option value="ops">运维</option><option value="research">研究</option></select>
        <select className="rounded border px-2 py-2 text-sm" value={risk} onChange={(e) => setRisk(e.target.value)}><option value="all">风险</option><option value="low">低</option><option value="medium">中</option><option value="high">高</option><option value="critical">严重</option></select>
        <select className="rounded border px-2 py-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}><option value="updatedAt">最近更新时间</option><option value="createdAt">创建时间</option><option value="endDate">计划结束时间</option><option value="risk">风险等级</option><option value="delta">进度偏差</option></select>
        <label className="ml-2 flex items-center gap-1 text-sm"><input type="checkbox" checked={onlyArchived} onChange={(e) => setOnlyArchived(e.target.checked)} /> 已归档</label>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" onClick={() => { setView("table"); localStorage.setItem(viewKey, "table"); }}>表格</Button>
          <Button variant="secondary" onClick={() => { setView("card"); localStorage.setItem(viewKey, "card"); }}>卡片</Button>
          <Link href="/app/projects/templates"><Button variant="secondary">项目模板</Button></Link>
          <Link href="/app/projects/new"><Button>新建项目</Button></Link>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm">
          <span>已选 {selected.length} 项</span>
          <Button disabled={saving} variant="secondary" onClick={() => runBatch({ ids: selected, action: onlyArchived ? "restore" : "archive" }, onlyArchived ? "批量恢复成功" : "批量归档成功")}>{saving ? "保存中..." : (onlyArchived ? "批量恢复" : "批量归档")}</Button>
          <select className="rounded border px-2 py-1" value={batchOwner} onChange={(e) => setBatchOwner(e.target.value)}>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
          <Button disabled={saving} variant="secondary" onClick={() => runBatch({ ids: selected, action: "change_owner", ownerId: batchOwner }, "负责人更新成功")}>批量改负责人</Button>
          <Button disabled={saving} variant="secondary" onClick={() => runBatch({ ids: selected, action: "change_tags", tagIds: ["tag4"] }, "标签更新成功")}>批量打标签</Button>
        </div>
      )}

      {isLoading && <div className="card p-8 text-center text-sm text-slate-500">加载项目中...</div>}
      {isError && <div className="card p-8 text-center text-sm text-red-600">项目加载失败</div>}
      {!isLoading && !isError && view === "table" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-3"></th><th>项目名称</th><th>项目编码</th><th>类型</th><th>阶段</th><th>状态</th><th>负责人</th><th>所属团队</th><th>计划结束</th><th>进度</th><th>风险</th><th>最近更新</th></tr></thead><tbody>{filtered.map((p) => <tr key={p.id} className="border-t border-slate-100 hover:bg-slate-50"><td className="p-3"><input type="checkbox" checked={selected.includes(p.id)} onChange={() => setSelected((arr) => arr.includes(p.id) ? arr.filter((x) => x !== p.id) : [...arr, p.id])} /></td><td><Link href={`/app/projects/${p.id}`} className="text-blue-700">{p.name}</Link></td><td>{p.code}</td><td>{p.type}</td><td>{p.phase}</td><td>{p.status}</td><td>{members.find((m) => m.id === p.ownerId)?.name}</td><td>{teams.find((t) => t.id === p.teamId)?.name}</td><td>{p.endDate.slice(0, 10)}</td><td><div className="h-2 w-24 rounded bg-slate-200"><div className="h-2 rounded bg-blue-600" style={{ width: `${p.progress}%` }} /></div></td><td>{p.riskLevel}</td><td>{p.updatedAt.slice(0, 10)}</td></tr>)}</tbody></table>
        </div>
      )}

      {!isLoading && !isError && view === "card" && <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{filtered.map((p) => <Card key={p.id} title={p.name}><p className="text-xs text-slate-500">{p.code} · {p.type} · {p.phase}</p><p className="mt-2 text-sm text-slate-600 line-clamp-2">{p.description}</p><div className="mt-3 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-blue-600" style={{ width: `${p.progress}%` }} /></div><div className="mt-3 flex items-center justify-between"><Link href={`/app/projects/${p.id}`} className="text-sm text-blue-700">进入详情</Link><span className="text-xs">风险 {p.riskLevel}</span></div></Card>)}</div>}
    </div>
  );
}
