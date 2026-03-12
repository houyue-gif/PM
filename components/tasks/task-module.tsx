"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getJson, patchJson, postJson } from "@/lib/api";
import { Task } from "@/types/domain";

type TaskResp = { items: Task[]; options: { projects: Array<{ id: string; name: string }>; members: Array<{ id: string; name: string }>; phases: Array<{ id: string; name: string }>; milestones: Array<{ id: string; name: string }> } };
const viewKey = "pm_task_view";

export function TaskModule({ mineTab }: { mineTab?: "todo" | "owner" | "participant" | "acceptance" | "accepted" }) {
  const qc = useQueryClient();
  const [view, setView] = useState<"table" | "board" | "calendar" | "gantt">(() => (typeof window === "undefined" ? "table" : ((localStorage.getItem(viewKey) as any) || "table")));
  const [q, setQ] = useState("");
  const [projectId, setProjectId] = useState("all");
  const [status, setStatus] = useState("all");
  const [ownerId, setOwnerId] = useState("all");
  const [acceptorId, setAcceptorId] = useState("all");
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [sort, setSort] = useState("plannedEndAt");
  const [selected, setSelected] = useState<string[]>([]);
  const [msg, setMsg] = useState("");
  const [drawer, setDrawer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", projectId: "pr1", ownerId: "u1", acceptorId: "u2", plannedEndAt: new Date(Date.now() + 86400000).toISOString().slice(0, 10), plannedStartAt: new Date().toISOString().slice(0, 10), priority: "medium", parentTaskId: "", description: "" });

  const mineQuery = mineTab === "owner" ? "mine=owner" : mineTab === "participant" ? "mine=participant" : mineTab === "acceptance" ? "mine=pending-acceptance" : mineTab === "accepted" ? "acceptance=done" : "";
  const { data, isLoading, isError } = useQuery({ queryKey: ["tasks", mineTab], queryFn: () => getJson<TaskResp>(`/api/tasks${mineQuery ? `?${mineQuery}` : ""}`) });
  const tasks = useMemo(() => {
    let arr = data?.items || [];
    arr = arr.filter((t) => [t.title, t.taskNo, t.ownerId, t.acceptorId].join(" ").toLowerCase().includes(q.toLowerCase()));
    if (projectId !== "all") arr = arr.filter((t) => t.projectId === projectId);
    if (status !== "all") arr = arr.filter((t) => t.status === status);
    if (ownerId !== "all") arr = arr.filter((t) => t.ownerId === ownerId);
    if (acceptorId !== "all") arr = arr.filter((t) => t.acceptorId === acceptorId);
    if (onlyOverdue) arr = arr.filter((t) => new Date(t.plannedEndAt) < new Date() && !["completed", "closed"].includes(t.status));
    return arr.sort((a, b) => sort === "priority" ? ["low", "medium", "high", "urgent"].indexOf(b.priority) - ["low", "medium", "high", "urgent"].indexOf(a.priority) : sort === "updatedAt" ? +new Date(b.updatedAt) - +new Date(a.updatedAt) : +new Date(a.plannedEndAt) - +new Date(b.plannedEndAt));
  }, [data, q, projectId, status, ownerId, acceptorId, onlyOverdue, sort]);

  const members = data?.options.members || [];
  const projects = data?.options.projects || [];

  const batch = async (payload: any, ok: string) => {
    try { setSaving(true); await patchJson("/api/tasks", payload); setMsg(ok); setSelected([]); qc.invalidateQueries({ queryKey: ["tasks"] }); }
    catch (e) { setMsg(e instanceof Error ? e.message : "保存失败"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      {msg && <div className="rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div>}
      <div className="flex flex-wrap items-center gap-2">
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索标题/编号/负责人/验收人" className="max-w-sm" />
        <select className="rounded border px-2 py-2 text-sm" value={projectId} onChange={(e) => setProjectId(e.target.value)}><option value="all">项目</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
        <select className="rounded border px-2 py-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}><option value="all">状态</option><option value="not_started">未开始</option><option value="in_progress">进行中</option><option value="blocked">已阻塞</option><option value="pending_acceptance">待验收</option><option value="completed">已完成</option><option value="closed">已关闭</option></select>
        <select className="rounded border px-2 py-2 text-sm" value={ownerId} onChange={(e) => setOwnerId(e.target.value)}><option value="all">负责人</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <select className="rounded border px-2 py-2 text-sm" value={acceptorId} onChange={(e) => setAcceptorId(e.target.value)}><option value="all">验收人</option>{members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
        <select className="rounded border px-2 py-2 text-sm" value={sort} onChange={(e) => setSort(e.target.value)}><option value="plannedEndAt">截止时间</option><option value="priority">优先级</option><option value="updatedAt">更新时间</option></select>
        <label className="text-sm"><input type="checkbox" checked={onlyOverdue} onChange={(e) => setOnlyOverdue(e.target.checked)} /> 仅逾期</label>
        <div className="ml-auto flex gap-2">{(["table", "board", "calendar", "gantt"] as const).map((v) => <Button key={v} variant="secondary" onClick={() => { setView(v); localStorage.setItem(viewKey, v); }}>{v}</Button>)}<Button onClick={() => setDrawer(true)}>新建任务</Button><Link href="/app/tasks/acceptance"><Button variant="secondary">待验收</Button></Link></div>
      </div>

      {selected.length > 0 && <div className="flex items-center gap-2 rounded border bg-slate-50 p-2 text-sm"><span>已选 {selected.length}</span><Button disabled={saving} variant="secondary" onClick={() => batch({ ids: selected, action: "batch_owner", ownerId: "u1" }, "批量改负责人成功")}>改负责人</Button><Button disabled={saving} variant="secondary" onClick={() => batch({ ids: selected, action: "batch_acceptor", acceptorId: "u2" }, "批量改验收人成功")}>改验收人</Button><Button disabled={saving} variant="secondary" onClick={() => batch({ ids: selected, action: "batch_status", status: "in_progress" }, "批量改状态成功")}>改状态</Button></div>}

      {isLoading && <div className="card p-8 text-center text-sm text-slate-500">任务加载中...</div>}
      {isError && <div className="card p-8 text-center text-sm text-red-600">任务加载失败</div>}

      {!isLoading && !isError && view === "table" && <div className="card overflow-auto"><table className="w-full text-sm"><thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-2"></th><th>任务名称</th><th>任务编号</th><th>项目</th><th>父任务</th><th>负责人</th><th>验收人</th><th>状态</th><th>优先级</th><th>计划开始</th><th>计划截止</th><th>实际完成</th><th>进度</th><th>逾期</th></tr></thead><tbody>{tasks.map((t)=><tr key={t.id} className="border-t hover:bg-slate-50"><td className="p-2"><input type="checkbox" checked={selected.includes(t.id)} onChange={() => setSelected((arr)=>arr.includes(t.id)?arr.filter(x=>x!==t.id):[...arr,t.id])} /></td><td><Link className="text-blue-700" href={`/app/tasks/${t.id}`}>{t.title}</Link></td><td>{t.taskNo}</td><td>{projects.find((p)=>p.id===t.projectId)?.name || t.projectId}</td><td>{t.parentTaskId || "-"}</td><td>{members.find((m)=>m.id===t.ownerId)?.name}</td><td>{members.find((m)=>m.id===t.acceptorId)?.name}</td><td><Badge label={t.status} className={t.status==="pending_acceptance"?"bg-amber-100 text-amber-700":""} /></td><td>{t.priority}</td><td>{t.plannedStartAt?.slice(0,10) || "-"}</td><td>{t.plannedEndAt.slice(0,10)}</td><td>{t.actualDoneAt?.slice(0,10) || "-"}</td><td>{t.progress}%</td><td>{new Date(t.plannedEndAt)<new Date() && !["completed","closed"].includes(t.status) ? <span className="text-red-600">逾期</span> : "-"}</td></tr>)}</tbody></table></div>}
      {!isLoading && !isError && view === "board" && <div className="grid grid-cols-3 gap-3">{["not_started","in_progress","pending_acceptance"].map((s)=><Card key={s} title={s}>{tasks.filter(t=>t.status===s).map(t=><p key={t.id} className="mb-2 rounded bg-slate-50 p-2 text-sm">{t.title}</p>)}</Card>)}</div>}
      {!isLoading && !isError && view === "calendar" && <div className="grid grid-cols-3 gap-3">{tasks.map((t)=><Card key={t.id} title={t.plannedEndAt.slice(0,10)}><p className="text-sm">{t.title}</p></Card>)}</div>}
      {!isLoading && !isError && view === "gantt" && <Link href="/app/tasks/gantt" className="text-blue-700">进入完整甘特图视图</Link>}

      {drawer && <TaskCreateDrawer form={form} setForm={setForm} members={members} projects={projects} onClose={() => setDrawer(false)} onCreated={async ()=>{setDrawer(false);setForm({ ...form, title: "" });qc.invalidateQueries({queryKey:["tasks"]});}} />}
    </div>
  );
}

function TaskCreateDrawer({ form, setForm, members, projects, onClose, onCreated }: any) {
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  return <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30"><div className="w-full max-w-2xl rounded-xl bg-white p-4"><h3 className="font-semibold">新建任务</h3><div className="mt-3 grid grid-cols-2 gap-2"><Input placeholder="任务标题*" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} /><select className="rounded border px-2 py-2 text-sm" value={form.projectId} onChange={(e)=>setForm({...form,projectId:e.target.value})}>{projects.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}</select><select className="rounded border px-2 py-2 text-sm" value={form.ownerId} onChange={(e)=>setForm({...form,ownerId:e.target.value})}>{members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select><select className="rounded border px-2 py-2 text-sm" value={form.acceptorId} onChange={(e)=>setForm({...form,acceptorId:e.target.value})}>{members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select><Input type="date" value={form.plannedStartAt} onChange={(e)=>setForm({...form,plannedStartAt:e.target.value})} /><Input type="date" value={form.plannedEndAt} onChange={(e)=>setForm({...form,plannedEndAt:e.target.value})} /><select className="rounded border px-2 py-2 text-sm" value={form.priority} onChange={(e)=>setForm({...form,priority:e.target.value})}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="urgent">urgent</option></select><Input placeholder="父任务ID（可选）" value={form.parentTaskId} onChange={(e)=>setForm({...form,parentTaskId:e.target.value})} /></div><Input className="mt-2" placeholder="描述" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} />{msg && <p className="mt-2 text-sm text-slate-600">{msg}</p>}<div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={onClose}>取消</Button><Button disabled={saving} onClick={async()=>{try{setSaving(true);await postJson('/api/tasks',form);setMsg('保存成功');await onCreated();}catch(e){setMsg(e instanceof Error?e.message:'保存失败');}finally{setSaving(false);}}}>{saving?'保存中...':'创建任务'}</Button></div></div></div>;
}
