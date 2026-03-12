"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getJson, patchJson, postJson } from "@/lib/api";
import { Member, Milestone, Project, ProjectPhase } from "@/types/domain";

type DetailData = { item: Project; phases: ProjectPhase[]; milestones: Milestone[]; activities: Array<{ id: string; message: string; createdAt: string; eventType?: string }>; members: Member[]; templates: Array<{ id: string; name: string }> };

export function ProjectDetailCenter({ projectId }: { projectId: string }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview" | "plan" | "milestones" | "activities" | "settings">("overview");
  const [planView, setPlanView] = useState<"list" | "timeline">("timeline");
  const [activityType, setActivityType] = useState("all");
  const [selectedNode, setSelectedNode] = useState<{ type: "phase" | "milestone"; id: string } | null>(null);
  const [settingsSection, setSettingsSection] = useState("basic");
  const [milestoneStatus, setMilestoneStatus] = useState("all");

  const { data, refetch } = useQuery({ queryKey: ["project-detail", projectId], queryFn: () => getJson<DetailData>(`/api/projects/${projectId}`) });
  const p = data?.item;
  const members = data?.members || [];
  const phases = data?.phases || [];
  const milestones = data?.milestones || [];
  const ownerName = members.find((m) => m.id === p?.ownerId)?.name;

  const delayed = milestones.filter((m) => m.status === "delayed" || (new Date(m.targetDate) < new Date() && m.status !== "done")).length;
  const highRisk = p?.riskLevel === "critical" || p?.riskLevel === "high" ? 1 : 0;
  const doneMs = milestones.filter((m) => m.status === "done").length;
  const milestoneRate = milestones.length ? Math.round((doneMs / milestones.length) * 100) : 0;

  const activeFilteredMilestones = useMemo(() => milestones.filter((m) => (milestoneStatus === "all" ? true : m.status === milestoneStatus)), [milestones, milestoneStatus]);
  const activityItems = useMemo(() => (data?.activities || []).filter((a) => activityType === "all" || a.eventType === activityType), [data, activityType]);

  if (!p) return <div className="card p-6">项目不存在</div>;

  const selectedPhase = selectedNode?.type === "phase" ? phases.find((x) => x.id === selectedNode.id) : null;
  const selectedMilestone = selectedNode?.type === "milestone" ? milestones.find((x) => x.id === selectedNode.id) : null;

  return (
    <div className="space-y-4">
      <Card title={`${p.name} · ${p.code}`}>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <span>状态：{p.status}</span><span>阶段：{p.phase}</span><span>负责人：{ownerName}</span><span>时间：{p.startDate.slice(0,10)} ~ {p.endDate.slice(0,10)}</span>
          <span className="rounded bg-slate-100 px-2 py-1 text-xs">风险 {p.riskLevel}</span>
          <div className="ml-auto flex gap-2"><Button variant="secondary" onClick={() => setTab("settings")}>编辑</Button><Button variant="secondary" onClick={async()=>{await patchJson(`/api/projects/${projectId}`,{archived: !p.archived}); refetch();}}> {p.archived ? "恢复" : "归档"} </Button></div>
        </div>
      </Card>

      <div className="flex gap-2 border-b border-slate-200 pb-2 text-sm">
        {(["overview", "plan", "milestones", "activities", "settings"] as const).map((x) => <button key={x} onClick={() => setTab(x)} className={`rounded px-3 py-1 ${tab === x ? "bg-slate-900 text-white" : "bg-slate-100"}`}>{x === "overview" ? "概览" : x === "plan" ? "计划" : x === "milestones" ? "里程碑" : x === "activities" ? "动态" : "设置"}</button>)}
      </div>

      {tab === "overview" && (
        <div className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">{[["总进度", `${p.progress}%`],["里程碑完成率", `${milestoneRate}%`],["延期事项数", `${delayed}`],["高风险事项", `${highRisk}`],["阻塞数", `${Math.max(0, p.scheduleDelta - 2)}`],["本周新增/完成", "6 / 4"]].map(([k,v]) => <Card key={k} title={k}><p className="text-2xl font-semibold">{v}</p></Card>)}</div>
          <div className="grid gap-3 lg:grid-cols-3">
            <Card title="计划摘要"><div className="mb-2 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-blue-600" style={{width:`${p.progress}%`}} /></div><p className="text-xs text-slate-500">阶段推进：{phases.length} 个阶段</p>{milestones.slice(0,3).map((m)=><p key={m.id} className="mt-2 text-sm">• {m.name} ({m.targetDate.slice(0,10)})</p>)}</Card>
            <Card title="团队摘要"><p className="text-sm">项目负责人：{ownerName}</p><p className="text-sm">核心参与人：{members.filter((m)=>p.memberIds.includes(m.id)).slice(0,3).map((m)=>m.name).join(" / ")}</p><p className="text-sm">成员数：{p.memberIds.length}</p></Card>
            <Card title="动态摘要">{activityItems.slice(0,5).map((a)=><p key={a.id} className="mb-1 text-sm text-slate-600">• {a.message}</p>)}</Card>
          </div>
        </div>
      )}

      {tab === "plan" && (
        <div className="grid gap-3 lg:grid-cols-[260px_1fr_320px]">
          <Card title="阶段 + 里程碑"><div className="space-y-2">{phases.map((ph)=><button key={ph.id} onClick={()=>setSelectedNode({type:"phase",id:ph.id})} className="block w-full rounded border p-2 text-left text-sm hover:bg-slate-50">阶段：{ph.name}</button>)}{milestones.map((ms)=><button key={ms.id} onClick={()=>setSelectedNode({type:"milestone",id:ms.id})} className="block w-full rounded border p-2 text-left text-sm hover:bg-slate-50">里程碑：{ms.name}</button>)}</div><Button className="mt-3" onClick={async()=>{await postJson(`/api/projects/${projectId}/phases`,{name:"新阶段",type:"planning",ownerId:p.ownerId,startDate:p.startDate,endDate:p.endDate,status:"pending",keyNode:false});qc.invalidateQueries({queryKey:["project-detail",projectId]});}}>新增阶段</Button><Button variant="secondary" className="mt-2" onClick={async()=>{await postJson(`/api/projects/${projectId}/milestones`,{name:"新里程碑",kind:"business",targetDate:p.endDate,status:"pending",ownerId:p.ownerId,criteria:"待定义",relatedTaskCount:0,keyNode:true});qc.invalidateQueries({queryKey:["project-detail",projectId]});}}>新增里程碑</Button></Card>
          <Card title="时间轴 / 甘特（基础版）"><div className="mb-3 flex gap-2 text-sm"><button className={`rounded px-2 py-1 ${planView==="list"?"bg-slate-900 text-white":"bg-slate-100"}`} onClick={()=>setPlanView("list")}>列表</button><button className={`rounded px-2 py-1 ${planView==="timeline"?"bg-slate-900 text-white":"bg-slate-100"}`} onClick={()=>setPlanView("timeline")}>时间轴</button></div>{planView==="list"?phases.map((ph)=><div key={ph.id} className="mb-2 rounded border p-2 text-sm">{ph.name} · {ph.startDate.slice(0,10)} ~ {ph.endDate.slice(0,10)} {ph.status==="delayed" && <span className="ml-2 text-orange-600">延期</span>}</div>):<div className="space-y-2">{[...phases,...milestones].sort((a,b)=>+new Date((a as any).startDate || (a as any).targetDate)-+new Date((b as any).startDate || (b as any).targetDate)).map((n:any)=><div key={n.id} className="rounded border-l-4 border-blue-500 bg-slate-50 p-2 text-sm">{n.name} · {(n.startDate || n.targetDate).slice(0,10)}</div>)}</div>}</Card>
          <Card title="详情编辑">
            {!selectedNode && <p className="text-sm text-slate-500">点击左侧阶段/里程碑进行编辑</p>}
            {selectedPhase && <EditorBlock fields={{name:selectedPhase.name,type:selectedPhase.type,date:selectedPhase.startDate.slice(0,10),status:selectedPhase.status,ownerId:selectedPhase.ownerId,note:selectedPhase.note||""}} onSave={async(v)=>{await postJson(`/api/projects/${projectId}/phases`,{id:selectedPhase.id,name:v.name,type:v.type,ownerId:v.ownerId,startDate:v.date,endDate:v.date,status:v.status,note:v.note,keyNode:false});qc.invalidateQueries({queryKey:["project-detail",projectId]});}} members={members} />}
            {selectedMilestone && <EditorBlock fields={{name:selectedMilestone.name,type:selectedMilestone.kind,date:selectedMilestone.targetDate.slice(0,10),status:selectedMilestone.status,ownerId:selectedMilestone.ownerId,note:selectedMilestone.note||""}} onSave={async(v)=>{await postJson(`/api/projects/${projectId}/milestones`,{id:selectedMilestone.id,name:v.name,kind:v.type,targetDate:v.date,status:v.status,ownerId:v.ownerId,criteria:selectedMilestone.criteria,relatedTaskCount:selectedMilestone.relatedTaskCount,note:v.note,keyNode:selectedMilestone.keyNode});qc.invalidateQueries({queryKey:["project-detail",projectId]});}} members={members} />}
          </Card>
        </div>
      )}

      {tab === "milestones" && (
        <Card title="里程碑治理视图">
          <div className="mb-3 flex items-center gap-2"><select className="rounded border px-2 py-2 text-sm" value={milestoneStatus} onChange={(e)=>setMilestoneStatus(e.target.value)}><option value="all">全部状态</option><option value="pending">pending</option><option value="on_track">on_track</option><option value="at_risk">at_risk</option><option value="done">done</option><option value="delayed">delayed</option></select><Button onClick={async()=>{await postJson(`/api/projects/${projectId}/milestones`,{name:"新建里程碑",kind:"business",targetDate:new Date().toISOString(),status:"pending",ownerId:p.ownerId,criteria:"待补充",relatedTaskCount:0,keyNode:false});qc.invalidateQueries({queryKey:["project-detail",projectId]});}}>新建里程碑</Button></div>
          <table className="w-full text-sm"><thead className="text-left text-slate-500"><tr><th>名称</th><th>类型</th><th>目标日期</th><th>实际完成</th><th>状态</th><th>负责人</th><th>达成标准</th><th>关联任务</th></tr></thead><tbody>{activeFilteredMilestones.map((m)=><tr key={m.id} className="border-t"><td className="py-2">{m.name}</td><td>{m.kind}</td><td>{m.targetDate.slice(0,10)}</td><td>{m.actualDate?.slice(0,10) || "-"}</td><td>{m.status}</td><td>{members.find((x)=>x.id===m.ownerId)?.name}</td><td>{m.criteria}</td><td>{m.relatedTaskCount}</td></tr>)}</tbody></table>
        </Card>
      )}

      {tab === "activities" && (
        <Card title="项目动态">
          <div className="mb-3"><select className="rounded border px-2 py-2 text-sm" value={activityType} onChange={(e)=>setActivityType(e.target.value)}><option value="all">全部类型</option><option value="project_update">项目信息变更</option><option value="owner_change">负责人变更</option><option value="phase_change">阶段变更</option><option value="milestone_change">里程碑变更</option><option value="risk_update">风险更新</option></select></div>
          <div className="space-y-2">{activityItems.map((a)=><div key={a.id} className="rounded border border-slate-200 p-3"><p className="text-sm">{a.message}</p><p className="text-xs text-slate-500">{a.createdAt.slice(0,16).replace("T"," ")}</p></div>)}</div>
        </Card>
      )}

      {tab === "settings" && (
        <div className="grid gap-3 lg:grid-cols-[220px_1fr]">
          <Card title="设置菜单"><div className="space-y-1 text-sm">{[["basic","基础信息"],["template","模板"],["lifecycle","生命周期"],["notification","通知"],["permission","权限入口"],["archive","归档与删除"]].map(([k,label])=><button key={k} onClick={()=>setSettingsSection(k)} className={`block w-full rounded px-2 py-1 text-left ${settingsSection===k?"bg-slate-900 text-white":"hover:bg-slate-100"}`}>{label}</button>)}</div></Card>
          <Card title="设置项">
            {settingsSection === "basic" && <BasicSettings project={p} members={members} onSaved={refetch} />}
            {settingsSection === "template" && <TemplateSettings project={p} templates={data?.templates || []} onSaved={refetch} />}
            {settingsSection === "lifecycle" && <p className="text-sm">生命周期配置已启用，当前阶段：{p.phase}。可流转规则与条件已预留。</p>}
            {settingsSection === "notification" && <NotificationSettings projectId={projectId} onSaved={refetch} />}
            {settingsSection === "permission" && <p className="text-sm">项目管理员：{p.adminIds.length} 人；成员组：{p.memberIds.length} 人；可见范围：{p.visibility}。</p>}
            {settingsSection === "archive" && <div className="space-x-2"><Button variant="secondary" onClick={async()=>{await patchJson(`/api/projects/${projectId}`,{archived:true}); refetch();}}>归档项目</Button><Button variant="secondary" onClick={async()=>{await patchJson(`/api/projects/${projectId}`,{archived:false}); refetch();}}>恢复项目</Button><Button variant="secondary">删除项目（仅系统管理员）</Button></div>}
          </Card>
        </div>
      )}
    </div>
  );
}

function EditorBlock({ fields, onSave, members }: { fields: { name: string; type: string; date: string; status: string; ownerId: string; note: string }; onSave: (v: { name: string; type: string; date: string; status: string; ownerId: string; note: string }) => Promise<void>; members: Member[] }) {
  const [f, setF] = useState(fields);
  return <div className="space-y-2"><Input value={f.name} onChange={(e)=>setF({...f,name:e.target.value})} /><Input value={f.type} onChange={(e)=>setF({...f,type:e.target.value})} /><Input type="date" value={f.date} onChange={(e)=>setF({...f,date:e.target.value})} /><Input value={f.status} onChange={(e)=>setF({...f,status:e.target.value})} /><select className="w-full rounded border px-2 py-2 text-sm" value={f.ownerId} onChange={(e)=>setF({...f,ownerId:e.target.value})}>{members.map((m)=><option key={m.id} value={m.id}>{m.name}</option>)}</select><Input value={f.note} onChange={(e)=>setF({...f,note:e.target.value})} placeholder="备注" /><Button onClick={()=>onSave(f)}>保存</Button></div>;
}

function BasicSettings({ project, members, onSaved }: { project: Project; members: Member[]; onSaved: () => void }) {
  const [f, setF] = useState({ name: project.name, code: project.code, description: project.description, ownerId: project.ownerId, startDate: project.startDate.slice(0,10), endDate: project.endDate.slice(0,10), visibility: project.visibility });
  return <div className="space-y-2"><Input value={f.name} onChange={(e)=>setF({...f,name:e.target.value})} /><Input value={f.code} onChange={(e)=>setF({...f,code:e.target.value})} /><Input value={f.description} onChange={(e)=>setF({...f,description:e.target.value})} /><select className="w-full rounded border px-2 py-2 text-sm" value={f.ownerId} onChange={(e)=>setF({...f,ownerId:e.target.value})}>{members.map((m)=><option key={m.id} value={m.id}>{m.name}</option>)}</select><div className="grid grid-cols-2 gap-2"><Input type="date" value={f.startDate} onChange={(e)=>setF({...f,startDate:e.target.value})} /><Input type="date" value={f.endDate} onChange={(e)=>setF({...f,endDate:e.target.value})} /></div><select className="w-full rounded border px-2 py-2 text-sm" value={f.visibility} onChange={(e)=>setF({...f,visibility:e.target.value as Project["visibility"]})}><option value="workspace">workspace</option><option value="team">team</option><option value="private">private</option></select><Button onClick={async()=>{await patchJson(`/api/projects/${project.id}`,f); onSaved();}}>保存基础信息</Button></div>;
}

function TemplateSettings({ project, templates, onSaved }: { project: Project; templates: Array<{ id: string; name: string }>; onSaved: () => void }) {
  const [templateId, setTemplateId] = useState(project.templateId || "");
  return <div className="space-y-3 text-sm"><p>当前模板来源：{project.templateId || "无"}</p><label className="flex items-center gap-2"><input type="checkbox" defaultChecked /> 继承模板</label><select className="w-full rounded border px-2 py-2" value={templateId} onChange={(e)=>setTemplateId(e.target.value)}><option value="">未选择模板</option>{templates.map((t)=><option key={t.id} value={t.id}>{t.name}</option>)}</select><div className="flex gap-2"><Button onClick={async()=>{await patchJson(`/api/projects/${project.id}`,{templateId}); onSaved();}}>应用模板更新</Button><Button variant="secondary">保存为模板</Button></div></div>;
}

function NotificationSettings({ projectId, onSaved }: { projectId: string; onSaved: () => void }) {
  const [f, setF] = useState({ milestoneReminder: true, delayAlert: true, ownerChange: true });
  return <div className="space-y-2 text-sm"><label className="flex gap-2"><input type="checkbox" checked={f.milestoneReminder} onChange={(e)=>setF({...f,milestoneReminder:e.target.checked})} /> 里程碑到期提醒</label><label className="flex gap-2"><input type="checkbox" checked={f.delayAlert} onChange={(e)=>setF({...f,delayAlert:e.target.checked})} /> 项目延期预警</label><label className="flex gap-2"><input type="checkbox" checked={f.ownerChange} onChange={(e)=>setF({...f,ownerChange:e.target.checked})} /> 负责人变更通知</label><Button onClick={async()=>{await patchJson(`/api/projects/${projectId}`,{notification:f}); onSaved();}}>保存通知设置</Button></div>;
}
