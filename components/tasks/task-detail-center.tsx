"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getJson, patchJson, postJson } from "@/lib/api";

export function TaskDetailCenter({ id }: { id: string }) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview"|"subtasks"|"deps"|"worklog"|"activity"|"acceptance">("overview");
  const [msg, setMsg] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const { data, isLoading, isError } = useQuery({ queryKey: ["task-detail", id], queryFn: () => getJson<any>(`/api/tasks/${id}`) });
  if (isLoading) return <div className="card p-6">加载中...</div>;
  if (isError || !data?.item) return <div className="card p-6 text-red-600">任务加载失败</div>;
  const t = data.item;

  const saveField = async (payload: any, ok = "保存成功") => {
    try { await patchJson("/api/tasks", { id, ...payload }); setMsg(ok); qc.invalidateQueries({ queryKey: ["task-detail", id] }); qc.invalidateQueries({ queryKey: ["tasks"] }); }
    catch (e) { setMsg(e instanceof Error ? e.message : "保存失败"); }
  };

  return (
    <div className="space-y-4">
      {msg && <div className="rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div>}
      <Card title={`${t.title} · ${t.taskNo}`}>
        <div className="grid gap-2 md:grid-cols-4 text-sm">
          <p>状态：{t.status}</p><p>优先级：{t.priority}</p><p>项目：{data.project?.name}</p><p>父任务：{data.parentPath?.map((p:any)=>p.title).join("/") || "-"}</p>
          <p>负责人：{data.members.find((m:any)=>m.id===t.ownerId)?.name}</p><p>验收人：{data.members.find((m:any)=>m.id===t.acceptorId)?.name}</p><p>计划开始：{t.plannedStartAt?.slice(0,10) || "-"}</p><p>计划截止：{t.plannedEndAt.slice(0,10)}</p>
          <p>实际开始：{t.actualStartAt?.slice(0,10) || "-"}</p><p>实际完成：{t.actualDoneAt?.slice(0,10) || "-"}</p>
        </div>
        <div className="mt-3 flex gap-2"><Button variant="secondary" onClick={() => saveField({ status: "in_progress" }, "已进入进行中")}>编辑/开始执行</Button><Button onClick={async()=>{try{await postJson(`/api/tasks/${id}/submit-acceptance`,{});setMsg("已提交验收");qc.invalidateQueries({queryKey:["task-detail",id]});}catch(e){setMsg(e instanceof Error?e.message:"提交失败");}}}>提交验收</Button></div>
      </Card>

      <div className="flex gap-2 border-b pb-2">{(["overview","subtasks","deps","worklog","activity","acceptance"] as const).map((x)=><button key={x} className={`rounded px-3 py-1 text-sm ${tab===x?"bg-slate-900 text-white":"bg-slate-100"}`} onClick={()=>setTab(x)}>{x}</button>)}</div>

      {tab === "overview" && <Card title="概览"><p className="text-sm">描述：{t.description || "暂无"}</p><p className="text-sm">交付标准：{t.completionNote || "暂无"}</p><p className="text-sm">风险说明：{t.riskLevel}</p><p className="text-sm">进度：{t.progress}%</p><p className="text-sm">是否逾期：{new Date(t.plannedEndAt) < new Date() && !["completed","closed"].includes(t.status) ? "是" : "否"}</p></Card>}

      {tab === "subtasks" && <SubTaskTab taskId={id} subtasks={data.subtasks} members={data.members} onDone={() => qc.invalidateQueries({ queryKey: ["task-detail", id] })} />}
      {tab === "deps" && <Card title="依赖"><p className="text-sm">前置任务数：{data.dependencies.predecessors.length}</p><p className="text-sm">后置任务数：{data.dependencies.successors.length}</p></Card>}
      {tab === "worklog" && <Card title="工时"><p className="text-sm">预估：{t.estimateHours}h · 已耗：{t.spentHours}h · 剩余：{t.remainingHours}h</p></Card>}
      {tab === "activity" && <Card title="动态">{data.activities.map((a:any)=><p key={a.id} className="mb-2 text-sm">• {a.message} <span className="text-xs text-slate-500">{a.createdAt.slice(0,16).replace('T',' ')}</span></p>)}</Card>}
      {tab === "acceptance" && <Card title="验收记录"><div className="space-y-2">{data.acceptanceRecords.map((a:any)=><div key={a.id} className="rounded border p-2 text-sm">状态：{a.status} · 提交：{a.submittedAt.slice(0,16).replace('T',' ')} {a.rejectReason && `· 驳回：${a.rejectReason}`}</div>)}</div><div className="mt-3 flex gap-2"><Button onClick={async()=>{try{await postJson(`/api/tasks/${id}/accept`,{comment:'通过'});setMsg('验收通过');qc.invalidateQueries({queryKey:['task-detail',id]});}catch(e){setMsg(e instanceof Error?e.message:'失败');}}}>通过</Button><Input className="max-w-xs" value={rejectReason} onChange={(e)=>setRejectReason(e.target.value)} placeholder="驳回原因" /><Button variant="secondary" onClick={async()=>{try{await postJson(`/api/tasks/${id}/reject`,{rejectReason});setMsg('已驳回');qc.invalidateQueries({queryKey:['task-detail',id]});}catch(e){setMsg(e instanceof Error?e.message:'失败');}}}>驳回</Button></div></Card>}
    </div>
  );
}

function SubTaskTab({ taskId, subtasks, members, onDone }: any) {
  const [title, setTitle] = useState("");
  const [msg, setMsg] = useState("");
  const [checked, setChecked] = useState<string[]>([]);
  const [ownerId, setOwnerId] = useState("u1");
  const [acceptorId, setAcceptorId] = useState("u2");
  const [plannedEndAt, setPlannedEndAt] = useState(new Date(Date.now() + 86400000).toISOString().slice(0,10));
  const completion = subtasks.length ? Math.round(subtasks.reduce((s:any, x:any) => s + x.progress, 0) / subtasks.length) : 0;
  return <Card title="子任务"><div className="mb-2 flex gap-2"><Input placeholder="子任务标题" value={title} onChange={(e)=>setTitle(e.target.value)} /><Button onClick={async()=>{try{await postJson(`/api/tasks/${taskId}/subtasks`,{title,ownerId,acceptorId,plannedEndAt});setMsg('新增成功');setTitle('');onDone();}catch(e){setMsg(e instanceof Error?e.message:'失败');}}}>新增子任务</Button></div><div className="mb-2 flex gap-2"><select className="rounded border px-2 py-2 text-sm" value={ownerId} onChange={(e)=>setOwnerId(e.target.value)}>{members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select><select className="rounded border px-2 py-2 text-sm" value={acceptorId} onChange={(e)=>setAcceptorId(e.target.value)}>{members.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select><Input type="date" value={plannedEndAt} onChange={(e)=>setPlannedEndAt(e.target.value)} className="max-w-[200px]" /><Button variant="secondary" onClick={async()=>{try{await patchJson(`/api/tasks/${taskId}/subtasks`,{ids:checked,ownerId,acceptorId,plannedEndAt});setMsg('批量修改成功');setChecked([]);onDone();}catch(e){setMsg(e instanceof Error?e.message:'失败');}}}>批量修改</Button><Button variant="secondary"><a href="/app/tasks/gantt">定位到甘特图</a></Button></div>{msg && <p className="text-sm text-slate-500">{msg}</p>}<table className="w-full text-sm"><thead><tr><th></th><th>名称</th><th>负责人</th><th>验收人</th><th>状态</th><th>计划开始</th><th>计划截止</th><th>实际完成</th><th>进度</th></tr></thead><tbody>{subtasks.map((s:any)=><tr key={s.id} className="border-t"><td><input type="checkbox" checked={checked.includes(s.id)} onChange={()=>setChecked((arr)=>arr.includes(s.id)?arr.filter(x=>x!==s.id):[...arr,s.id])} /></td><td>{s.title}</td><td>{members.find((m:any)=>m.id===s.ownerId)?.name}</td><td>{members.find((m:any)=>m.id===s.acceptorId)?.name}</td><td>{s.status}</td><td>{s.plannedStartAt?.slice(0,10)||'-'}</td><td>{s.plannedEndAt.slice(0,10)}</td><td>{s.actualDoneAt?.slice(0,10)||'-'}</td><td>{s.progress}%</td></tr>)}</tbody></table><div className="mt-3 rounded bg-slate-50 p-2 text-sm">父任务聚合：最早开始 {subtasks.map((x:any)=>x.plannedStartAt).filter(Boolean).sort()[0]?.slice(0,10)||'-'} · 最晚截止 {subtasks.map((x:any)=>x.plannedEndAt).sort().slice(-1)[0]?.slice(0,10)||'-'} · 完成率 {completion}% · 待验收 {subtasks.filter((x:any)=>x.status==='pending_acceptance').length}</div></Card>;
}
