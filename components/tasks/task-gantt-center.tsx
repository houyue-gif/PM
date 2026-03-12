"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getJson, patchJson } from "@/lib/api";

export function TaskGanttCenter() {
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [msg, setMsg] = useState("");
  const { data, refetch } = useQuery({ queryKey: ["gantt", onlyOverdue], queryFn: () => getJson<{ items: any[]; today: string }>(`/api/tasks/gantt?overdue=${onlyOverdue}`) });
  const rows = data?.items || [];
  return <div className="grid gap-3 lg:grid-cols-[1fr_320px]"><div className="space-y-3"><div className="flex items-center gap-2"><label className="text-sm"><input type="checkbox" checked={onlyOverdue} onChange={(e)=>setOnlyOverdue(e.target.checked)} /> 仅逾期</label><Link href="/app/tasks"><Button variant="secondary">返回任务列表</Button></Link></div>{msg && <div className="rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div>}<div className="rounded border"><div className="grid grid-cols-[320px_1fr] border-b bg-slate-50 p-2 text-xs text-slate-500"><div>任务树（名称/负责人/验收人/状态）</div><div>时间轴（普通甘特） · 今日线 {data?.today}</div></div>{rows.map((t)=><div key={t.id} className="grid grid-cols-[320px_1fr] border-b p-2 text-sm"><button className="text-left" onClick={()=>setSelected(t)}>{t.parentTaskId ? "└ " : ""}{t.title} · {t.status} {t.overdue && <span className="text-red-600">(逾期)</span>}</button><div><div className="h-3 rounded bg-slate-100"><div className={`h-3 rounded ${t.overdue?"bg-red-500":"bg-blue-600"}`} style={{width:`${Math.max(8,t.progress)}%`}} /></div><p className="mt-1 text-xs text-slate-500">{t.plannedStartAt?.slice(0,10) || "-"} ~ {t.plannedEndAt.slice(0,10)} · 完成 {t.progress}%</p></div></div>)}</div></div><div className="card"><h3 className="mb-2 font-semibold">详情/编辑面板</h3>{selected ? <div className="space-y-2 text-sm"><p>{selected.title}</p><input className="w-full rounded border px-2 py-2" type="date" defaultValue={(selected.plannedStartAt||"").slice(0,10)} id="ps" /><input className="w-full rounded border px-2 py-2" type="date" defaultValue={selected.plannedEndAt.slice(0,10)} id="pe" /><Button onClick={async()=>{const ps=(document.getElementById('ps') as HTMLInputElement).value;const pe=(document.getElementById('pe') as HTMLInputElement).value;try{await patchJson('/api/tasks',{id:selected.id,plannedStartAt:ps,plannedEndAt:pe});setMsg('时间已保存');refetch();}catch(e){setMsg(e instanceof Error?e.message:'失败')}}}>保存时间</Button></div> : <p className="text-sm text-slate-500">点击左侧任务</p>}</div></div>;
}
