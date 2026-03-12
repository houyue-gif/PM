"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { getJson, patchJson } from "@/lib/api";

export function TaskSettingsCenter() {
  const [msg, setMsg] = useState("");
  const { data, refetch } = useQuery({ queryKey: ["task-settings"], queryFn: () => getJson<any>("/api/tasks/settings") });
  const [local, setLocal] = useState<any>(null);
  const s = local || data;
  if (!s) return <div className="card p-6">加载中...</div>;
  return <div className="grid gap-3 lg:grid-cols-2">{msg && <div className="col-span-2 rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div>}<div className="card"><h3 className="mb-2 font-semibold">状态流</h3><p className="text-sm">{s.statusFlow.join(" -> ")}</p></div><div className="card"><h3 className="mb-2 font-semibold">验收规则</h3><label className="block text-sm"><input type="checkbox" checked={s.acceptanceRules.forceAcceptor} onChange={(e)=>setLocal({...s,acceptanceRules:{...s.acceptanceRules,forceAcceptor:e.target.checked}})} /> 强制验收人</label><label className="block text-sm"><input type="checkbox" checked={s.acceptanceRules.requireKeySubtasks} onChange={(e)=>setLocal({...s,acceptanceRules:{...s.acceptanceRules,requireKeySubtasks:e.target.checked}})} /> 关键子任务先通过</label></div><div className="card"><h3 className="mb-2 font-semibold">甘特设置</h3><label className="block text-sm"><input type="checkbox" checked={s.ganttRules.forceStartTime} onChange={(e)=>setLocal({...s,ganttRules:{...s.ganttRules,forceStartTime:e.target.checked}})} /> 强制开始时间</label><label className="block text-sm"><input type="checkbox" checked={s.ganttRules.parentChildLinked} onChange={(e)=>setLocal({...s,ganttRules:{...s.ganttRules,parentChildLinked:e.target.checked}})} /> 父子时间联动</label><label className="block text-sm"><input type="checkbox" checked={s.ganttRules.forbidChildOverflow} onChange={(e)=>setLocal({...s,ganttRules:{...s.ganttRules,forbidChildOverflow:e.target.checked}})} /> 限制子任务越界</label></div><div className="card"><h3 className="mb-2 font-semibold">字段设置</h3>{Object.entries(s.fieldToggles).map(([k,v]:any)=><label key={k} className="mr-2 inline-block text-sm"><input type="checkbox" checked={v} onChange={(e)=>setLocal({...s,fieldToggles:{...s.fieldToggles,[k]:e.target.checked}})} /> {k}</label>)}</div><div className="col-span-2"><Button onClick={async()=>{try{await patchJson('/api/tasks/settings',s);setMsg('设置已保存');setLocal(null);refetch();}catch(e){setMsg(e instanceof Error?e.message:'失败')}}}>保存任务设置</Button></div></div>;
}
