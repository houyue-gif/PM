"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getJson, patchJson, postJson } from "@/lib/api";
import { Member, Milestone, Project, ProjectPhase } from "@/types/domain";

type DetailData = { item: Project; phases: ProjectPhase[]; milestones: Milestone[]; activities: Array<{ id: string; message: string; createdAt: string; eventType?: string }>; members: Member[]; templates: Array<{ id: string; name: string }> };

export function ProjectDetailCenter({ projectId, initialTab = "overview" }: { projectId: string; initialTab?: "overview" | "plan" | "milestones" | "activities" | "settings" }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "plan" | "milestones" | "activities" | "settings">(initialTab);
  const [selectedNode, setSelectedNode] = useState<{ type: "phase" | "milestone"; id: string } | null>(null);
  const [settingsSection, setSettingsSection] = useState("basic");
  const [milestoneStatus, setMilestoneStatus] = useState("all");
  const [opMsg, setOpMsg] = useState("");

  const { data, refetch, isLoading, isError } = useQuery({ queryKey: ["project-detail", projectId], queryFn: () => getJson<DetailData>(`/api/projects/${projectId}`) });
  const p = data?.item;
  const members = data?.members || [];
  const phases = data?.phases || [];
  const milestones = data?.milestones || [];
  if (isLoading) return <div className="card p-6">加载中...</div>;
  if (isError || !p) return <div className="card p-6 text-red-600">项目加载失败</div>;

  const ownerName = members.find((m) => m.id === p.ownerId)?.name;
  const doneMs = milestones.filter((m) => m.status === "done").length;
  const milestoneRate = milestones.length ? Math.round((doneMs / milestones.length) * 100) : 0;
  const selectedPhase = selectedNode?.type === "phase" ? phases.find((x) => x.id === selectedNode.id) : null;
  const selectedMilestone = selectedNode?.type === "milestone" ? milestones.find((x) => x.id === selectedNode.id) : null;
  const activityItems = useMemo(() => data.activities, [data]);

  return (
    <div className="space-y-4">
      {opMsg && <div className="rounded bg-slate-100 px-3 py-2 text-sm">{opMsg}</div>}
      <Card title={`${p.name} · ${p.code}`}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>状态：{p.status}</span><span>阶段：{p.phase}</span><span>负责人：{ownerName}</span><span>时间：{p.startDate.slice(0, 10)} ~ {p.endDate.slice(0, 10)}</span>
          <div className="ml-auto flex gap-2"><Button variant="secondary" onClick={() => setTab("settings")}>编辑</Button><Button variant="secondary" onClick={async()=>{try{await patchJson(`/api/projects/${projectId}`,{archived:!p.archived});setOpMsg("保存成功");refetch();}catch(e){setOpMsg(e instanceof Error?e.message:"保存失败");}}}>{p.archived ? "恢复" : "归档"}</Button></div>
        </div>
      </Card>

      <div className="flex gap-2 border-b border-slate-200 pb-2 text-sm">{(["overview", "plan", "milestones", "activities", "settings"] as const).map((x) => <button key={x} onClick={() => setTab(x)} className={`rounded px-3 py-1 ${tab === x ? "bg-slate-900 text-white" : "bg-slate-100"}`}>{x}</button>)}</div>

      {tab === "overview" && <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{[["总进度", `${p.progress}%`], ["里程碑完成率", `${milestoneRate}%`], ["延期事项数", `${milestones.filter((m)=>m.status==="delayed").length}`], ["高风险事项", `${p.riskLevel}`], ["阻塞数", `${Math.max(0, p.scheduleDelta - 2)}`], ["本周新增/完成", "6 / 4"]].map(([k,v]) => <Card key={k} title={k}><p className="text-2xl font-semibold">{v}</p></Card>)}</div>}

      {tab === "plan" && (
        <div className="grid gap-3 lg:grid-cols-[260px_1fr_320px]">
          <Card title="阶段 + 里程碑"><div className="space-y-2">{phases.map((ph)=><button key={ph.id} onClick={()=>setSelectedNode({type:"phase",id:ph.id})} className="block w-full rounded border p-2 text-left text-sm">阶段：{ph.name}</button>)}{milestones.map((ms)=><button key={ms.id} onClick={()=>setSelectedNode({type:"milestone",id:ms.id})} className="block w-full rounded border p-2 text-left text-sm">里程碑：{ms.name}</button>)}</div><Button className="mt-3" onClick={async()=>{try{await postJson(`/api/projects/${projectId}/phases`,{name:"新阶段",type:"planning",ownerId:p.ownerId,startDate:p.startDate,endDate:p.endDate,status:"pending",keyNode:false});setOpMsg("阶段创建成功");qc.invalidateQueries({queryKey:["project-detail",projectId]});}catch(e){setOpMsg(e instanceof Error?e.message:"保存失败");}}}>新增阶段</Button><Button variant="secondary" className="mt-2" onClick={async()=>{try{await postJson(`/api/projects/${projectId}/milestones`,{name:"新里程碑",kind:"business",targetDate:p.endDate,status:"pending",ownerId:p.ownerId,criteria:"待定义",relatedTaskCount:0,keyNode:true});setOpMsg("里程碑创建成功");qc.invalidateQueries({queryKey:["project-detail",projectId]});}catch(e){setOpMsg(e instanceof Error?e.message:"保存失败");}}}>新增里程碑</Button></Card>
          <Card title="时间轴">{[...phases.map((x:any)=>({id:x.id,name:x.name,date:x.startDate})),...milestones.map((x:any)=>({id:x.id,name:x.name,date:x.targetDate}))].sort((a,b)=>+new Date(a.date)-+new Date(b.date)).map((n)=> <p key={n.id} className="mb-2 text-sm">• {n.name} · {n.date.slice(0,10)}</p>)}</Card>
          <Card title="详情编辑">{selectedPhase && <EditorBlock fields={{name:selectedPhase.name,type:selectedPhase.type,date:selectedPhase.startDate.slice(0,10),status:selectedPhase.status,ownerId:selectedPhase.ownerId,note:selectedPhase.note||""}} members={members} onSave={async(v)=>{await postJson(`/api/projects/${projectId}/phases`,{id:selectedPhase.id,name:v.name,type:v.type,ownerId:v.ownerId,startDate:v.date,endDate:v.date,status:v.status,note:v.note,keyNode:false});qc.invalidateQueries({queryKey:["project-detail",projectId]});}} />} {selectedMilestone && <EditorBlock fields={{name:selectedMilestone.name,type:selectedMilestone.kind,date:selectedMilestone.targetDate.slice(0,10),status:selectedMilestone.status,ownerId:selectedMilestone.ownerId,note:selectedMilestone.note||""}} members={members} onSave={async(v)=>{await postJson(`/api/projects/${projectId}/milestones`,{id:selectedMilestone.id,name:v.name,kind:v.type,targetDate:v.date,status:v.status,ownerId:v.ownerId,criteria:selectedMilestone.criteria,relatedTaskCount:selectedMilestone.relatedTaskCount,note:v.note,keyNode:selectedMilestone.keyNode});qc.invalidateQueries({queryKey:["project-detail",projectId]});}} />}</Card>
        </div>
      )}

      {tab === "milestones" && <Card title="里程碑治理视图"><div className="mb-3 flex items-center gap-2"><select className="rounded border px-2 py-2 text-sm" value={milestoneStatus} onChange={(e)=>setMilestoneStatus(e.target.value)}><option value="all">全部状态</option><option value="pending">pending</option><option value="on_track">on_track</option><option value="at_risk">at_risk</option><option value="done">done</option><option value="delayed">delayed</option></select></div><table className="w-full text-sm"><thead><tr><th>名称</th><th>目标日期</th><th>状态</th><th>负责人</th></tr></thead><tbody>{milestones.filter((m)=>milestoneStatus==="all"||m.status===milestoneStatus).map((m)=><tr key={m.id} className="border-t"><td>{m.name}</td><td>{m.targetDate.slice(0,10)}</td><td>{m.status}</td><td>{members.find((x)=>x.id===m.ownerId)?.name}</td></tr>)}</tbody></table></Card>}

      {tab === "activities" && <Card title="项目动态">{activityItems.map((a)=><div key={a.id} className="rounded border p-2 mb-2"><p className="text-sm">{a.message}</p><p className="text-xs text-slate-500">{a.createdAt.slice(0,16).replace("T"," ")}</p></div>)}</Card>}

      {tab === "settings" && <div className="grid gap-3 lg:grid-cols-[220px_1fr]"><Card title="设置菜单">{[["basic","基础信息"],["template","模板"],["notification","通知"],["archive","归档与删除"]].map(([k,label])=><button key={k} onClick={()=>setSettingsSection(k)} className={`block w-full rounded px-2 py-1 text-left ${settingsSection===k?"bg-slate-900 text-white":"hover:bg-slate-100"}`}>{label}</button>)}</Card><Card title="设置项">{settingsSection==="basic"&&<BasicSettings project={p} members={members} onSaved={refetch} />}{settingsSection==="template"&&<TemplateSettings project={p} templates={data.templates} onSaved={refetch} />}{settingsSection==="notification"&&<NotificationSettings projectId={projectId} onSaved={refetch} />}{settingsSection==="archive"&&<div className="space-x-2"><Button variant="secondary" onClick={async()=>{await postJson(`/api/projects/${projectId}/archive`,{});refetch();}}>归档项目</Button><Button variant="secondary" onClick={async()=>{await postJson(`/api/projects/${projectId}/restore`,{});refetch();}}>恢复项目</Button></div>}</Card></div>}
    </div>
  );
}

function EditorBlock({ fields, onSave, members }: { fields: { name: string; type: string; date: string; status: string; ownerId: string; note: string }; onSave: (v: { name: string; type: string; date: string; status: string; ownerId: string; note: string }) => Promise<void>; members: Member[] }) {
  const [f, setF] = useState(fields);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  return <div className="space-y-2"><Input value={f.name} onChange={(e)=>setF({...f,name:e.target.value})} /><Input value={f.type} onChange={(e)=>setF({...f,type:e.target.value})} /><Input type="date" value={f.date} onChange={(e)=>setF({...f,date:e.target.value})} /><Input value={f.status} onChange={(e)=>setF({...f,status:e.target.value})} /><select className="w-full rounded border px-2 py-2 text-sm" value={f.ownerId} onChange={(e)=>setF({...f,ownerId:e.target.value})}>{members.map((m)=><option key={m.id} value={m.id}>{m.name}</option>)}</select><Input value={f.note} onChange={(e)=>setF({...f,note:e.target.value})} placeholder="备注" />{msg && <p className="text-xs text-slate-500">{msg}</p>}<Button disabled={saving} onClick={async()=>{try{setSaving(true);await onSave(f);setMsg("保存成功");}catch(e){setMsg(e instanceof Error?e.message:"保存失败");}finally{setSaving(false);}}}>{saving?"保存中...":"保存"}</Button></div>;
}

function BasicSettings({ project, members, onSaved }: { project: Project; members: Member[]; onSaved: () => void }) {
  const [f, setF] = useState({ name: project.name, code: project.code, description: project.description, ownerId: project.ownerId, startDate: project.startDate.slice(0,10), endDate: project.endDate.slice(0,10), visibility: project.visibility });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  return <div className="space-y-2"><Input value={f.name} onChange={(e)=>setF({...f,name:e.target.value})} /><Input value={f.code} onChange={(e)=>setF({...f,code:e.target.value})} /><Input value={f.description} onChange={(e)=>setF({...f,description:e.target.value})} /><select className="w-full rounded border px-2 py-2 text-sm" value={f.ownerId} onChange={(e)=>setF({...f,ownerId:e.target.value})}>{members.map((m)=><option key={m.id} value={m.id}>{m.name}</option>)}</select><div className="grid grid-cols-2 gap-2"><Input type="date" value={f.startDate} onChange={(e)=>setF({...f,startDate:e.target.value})} /><Input type="date" value={f.endDate} onChange={(e)=>setF({...f,endDate:e.target.value})} /></div><select className="w-full rounded border px-2 py-2 text-sm" value={f.visibility} onChange={(e)=>setF({...f,visibility:e.target.value as Project["visibility"]})}><option value="workspace">workspace</option><option value="team">team</option><option value="private">private</option></select>{msg && <p className="text-xs text-slate-500">{msg}</p>}<Button disabled={saving} onClick={async()=>{try{setSaving(true);await patchJson(`/api/projects/${project.id}`,f);setMsg("保存成功");onSaved();}catch(e){setMsg(e instanceof Error?e.message:"保存失败");}finally{setSaving(false);}}}>{saving?"保存中...":"保存基础信息"}</Button></div>;
}

function TemplateSettings({ project, templates, onSaved }: { project: Project; templates: Array<{ id: string; name: string }>; onSaved: () => void }) {
  const [templateId, setTemplateId] = useState(project.templateId || "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  return <div className="space-y-3 text-sm"><p>当前模板来源：{project.templateId || "无"}</p><select className="w-full rounded border px-2 py-2" value={templateId} onChange={(e)=>setTemplateId(e.target.value)}><option value="">未选择模板</option>{templates.map((t)=><option key={t.id} value={t.id}>{t.name}</option>)}</select>{msg && <p className="text-xs text-slate-500">{msg}</p>}<Button disabled={saving} onClick={async()=>{try{setSaving(true);await patchJson(`/api/projects/${project.id}`,{templateId});setMsg("模板保存成功");onSaved();}catch(e){setMsg(e instanceof Error?e.message:"保存失败");}finally{setSaving(false);}}}>{saving?"保存中...":"应用模板更新"}</Button></div>;
}

function NotificationSettings({ projectId, onSaved }: { projectId: string; onSaved: () => void }) {
  const [f, setF] = useState({ milestoneReminder: true, delayAlert: true, ownerChange: true });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  return <div className="space-y-2 text-sm"><label className="flex gap-2"><input type="checkbox" checked={f.milestoneReminder} onChange={(e)=>setF({...f,milestoneReminder:e.target.checked})} /> 里程碑到期提醒</label><label className="flex gap-2"><input type="checkbox" checked={f.delayAlert} onChange={(e)=>setF({...f,delayAlert:e.target.checked})} /> 项目延期预警</label><label className="flex gap-2"><input type="checkbox" checked={f.ownerChange} onChange={(e)=>setF({...f,ownerChange:e.target.checked})} /> 负责人变更通知</label>{msg && <p className="text-xs text-slate-500">{msg}</p>}<Button disabled={saving} onClick={async()=>{try{setSaving(true);await patchJson(`/api/projects/${projectId}`,{notification:f});setMsg("通知设置已保存");onSaved();}catch(e){setMsg(e instanceof Error?e.message:"保存失败");}finally{setSaving(false);}}}>{saving?"保存中...":"保存通知设置"}</Button></div>;
}
