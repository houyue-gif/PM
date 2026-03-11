"use client";

import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getJson, patchJson, postJson } from "@/lib/api";
import { Task } from "@/types/domain";

const columns: Task["status"][] = ["todo", "in_progress", "review", "done"];

export function TaskCenter({ mineOnly = false }: { mineOnly?: boolean }) {
  const qc = useQueryClient();
  const [view, setView] = useState<"list" | "board" | "calendar">("list");
  const [open, setOpen] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [comment, setComment] = useState("");

  const { data } = useQuery({ queryKey: ["tasks"], queryFn: () => getJson<{ items: Task[] }>("/app/api/tasks") });
  const tasks = useMemo(() => (mineOnly ? data?.items.filter((t) => t.assigneeId === "u1") : data?.items) ?? [], [data, mineOnly]);
  const active = tasks.find((t) => t.id === open);

  const createTask = async () => {
    if (!newTitle) return;
    await postJson("/app/api/tasks", { title: newTitle, projectId: "pr1", assigneeId: "u1", priority: "medium" });
    setNewTitle("");
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="快速新建任务" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="max-w-xs" />
        <Button onClick={createTask}>新建任务</Button>
        <div className="ml-auto flex gap-2">
          {(["list", "board", "calendar"] as const).map((v) => <button key={v} onClick={() => setView(v)} className={`rounded-md px-3 py-1 text-sm ${view === v ? "bg-slate-900 text-white" : "bg-slate-100"}`}>{v}</button>)}
        </div>
      </div>

      {view === "list" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500"><tr><th className="p-3">标题</th><th>状态</th><th>优先级</th><th>截止</th></tr></thead>
            <tbody>
              {tasks.map((t) => <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50" onClick={() => setOpen(t.id)}><td className="cursor-pointer p-3">{t.title}</td><td><Badge label={t.status} /></td><td><Badge label={t.priority} /></td><td>{t.dueDate.slice(0,10)}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {view === "board" && <div className="grid grid-cols-4 gap-3">{columns.map((c) => <Card key={c} title={c}>{tasks.filter((t) => t.status === c).map((t) => <div key={t.id} className="mb-2 rounded-lg border border-slate-200 p-2"><p className="text-sm font-medium">{t.title}</p><div className="mt-2 flex gap-2">{columns.filter((x)=>x!==c).slice(0,1).map((next)=><button key={next} className="text-xs text-blue-600" onClick={async()=>{await patchJson('/app/api/tasks',{id:t.id,status:next});qc.invalidateQueries({queryKey:['tasks']});}} >转为 {next}</button>)}</div></div>)}</Card>)}</div>}

      {view === "calendar" && <div className="grid grid-cols-3 gap-3">{tasks.map((t)=><Card key={t.id} title={t.dueDate.slice(0,10)}><p className="text-sm">{t.title}</p></Card>)}</div>}

      {active && <TaskDrawer id={active.id} title={active.title} onClose={() => setOpen(null)} comment={comment} setComment={setComment} />}
    </div>
  );
}

function TaskDrawer({ id, title, onClose, comment, setComment }: { id: string; title: string; onClose: () => void; comment: string; setComment: (v: string) => void }) {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["comments", id], queryFn: () => getJson<{ items: Array<{ id: string; content: string; createdAt: string }> }>(`/app/api/tasks/${id}/comments`) });

  return (
    <div className="fixed inset-y-0 right-0 z-30 w-[30rem] border-l border-slate-200 bg-white p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">{title}</h3><button onClick={onClose}>关闭</button></div>
      <p className="mb-2 text-xs text-slate-500">评论区（支持 @提及 视觉样式）</p>
      <div className="space-y-2">{data?.items.map((c)=><div key={c.id} className="rounded-lg bg-slate-50 p-2 text-sm" dangerouslySetInnerHTML={{__html:c.content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>')}} />)}</div>
      <div className="mt-4 flex gap-2"><Input value={comment} onChange={(e)=>setComment(e.target.value)} placeholder="发表评论，支持 @Bruce" /><Button onClick={async()=>{await postJson(`/app/api/tasks/${id}/comments`,{content:comment});setComment("");qc.invalidateQueries({queryKey:["comments", id]});}}>发送</Button></div>
    </div>
  );
}
