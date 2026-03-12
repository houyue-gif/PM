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

  const { data, isLoading, isError } = useQuery({ queryKey: ["tasks"], queryFn: () => getJson<{ items: Task[] }>("/api/tasks") });
  const tasks = useMemo(() => (mineOnly ? data?.items.filter((t) => t.assigneeId === "u1") : data?.items) ?? [], [data, mineOnly]);
  const active = tasks.find((t) => t.id === open);

  const createTask = async () => {
    if (!newTitle.trim()) return;
    await postJson("/api/tasks", { title: newTitle, projectId: "pr1", assigneeId: "u1", priority: "medium" });
    setNewTitle("");
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input placeholder="快速新建任务" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="max-w-xs" />
        <Button onClick={createTask}>新建任务</Button>
        <div className="ml-auto flex gap-2">
          {(["list", "board", "calendar"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`rounded-md px-3 py-1 text-sm ${view === v ? "bg-slate-900 text-white" : "bg-slate-100"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="card p-8 text-center text-sm text-slate-500">任务加载中...</div>}
      {isError && <div className="card p-8 text-center text-sm text-red-500">任务加载失败，请稍后重试</div>}
      {!isLoading && !isError && tasks.length === 0 && <div className="card p-8 text-center text-sm text-slate-500">暂无任务，点击上方按钮创建第一条任务</div>}

      {!isLoading && !isError && tasks.length > 0 && view === "list" && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr><th className="p-3">标题</th><th>状态</th><th>优先级</th><th>截止</th></tr>
            </thead>
            <tbody>
              {tasks.map((t) => (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50" onClick={() => setOpen(t.id)}>
                  <td className="cursor-pointer p-3">{t.title}</td>
                  <td><Badge label={t.status} /></td>
                  <td><Badge label={t.priority} /></td>
                  <td>{t.dueDate.slice(0, 10)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && tasks.length > 0 && view === "board" && (
        <div className="grid grid-cols-4 gap-3">
          {columns.map((c) => (
            <Card key={c} title={c}>
              {tasks.filter((t) => t.status === c).map((t) => (
                <div key={t.id} className="mb-2 rounded-lg border border-slate-200 p-2">
                  <p className="text-sm font-medium">{t.title}</p>
                  <div className="mt-2 flex gap-2">
                    {columns.filter((x) => x !== c).slice(0, 1).map((next) => (
                      <button
                        key={next}
                        className="text-xs text-blue-600"
                        onClick={async () => {
                          await patchJson("/api/tasks", { id: t.id, status: next });
                          qc.invalidateQueries({ queryKey: ["tasks"] });
                        }}
                      >
                        转为 {next}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </Card>
          ))}
        </div>
      )}

      {!isLoading && !isError && tasks.length > 0 && view === "calendar" && (
        <div className="grid grid-cols-3 gap-3">
          {tasks.map((t) => (
            <Card key={t.id} title={t.dueDate.slice(0, 10)}>
              <p className="text-sm">{t.title}</p>
            </Card>
          ))}
        </div>
      )}

      {active && <TaskDrawer task={active} onClose={() => setOpen(null)} />}
    </div>
  );
}

function TaskDrawer({ task, onClose }: { task: Task; onClose: () => void }) {
  const qc = useQueryClient();
  const [comment, setComment] = useState("");
  const [subtaskTitle, setSubtaskTitle] = useState("");
  const [form, setForm] = useState({ title: task.title, description: task.description, assigneeId: task.assigneeId, priority: task.priority, dueDate: task.dueDate.slice(0, 10) });

  const { data: comments } = useQuery({ queryKey: ["comments", task.id], queryFn: () => getJson<{ items: Array<{ id: string; content: string }> }>(`/api/tasks/${task.id}/comments`) });
  const { data: activities } = useQuery({ queryKey: ["activities", task.id], queryFn: () => getJson<{ items: Array<{ id: string; message: string }> }>(`/api/activities?scopeId=${task.id}`) });

  const save = async () => {
    await patchJson("/api/tasks", { id: task.id, ...form, dueDate: new Date(form.dueDate).toISOString() });
    qc.invalidateQueries({ queryKey: ["tasks"] });
  };

  return (
    <div className="fixed inset-y-0 right-0 z-30 w-[34rem] overflow-y-auto border-l border-slate-200 bg-white p-4 shadow-2xl">
      <div className="mb-4 flex items-center justify-between"><h3 className="font-semibold">任务详情</h3><button onClick={onClose}>关闭</button></div>
      <div className="space-y-2">
        <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="描述" />
        <div className="grid grid-cols-3 gap-2">
          <select className="rounded-lg border border-slate-200 px-2 py-2 text-sm" value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })}><option value="u1">Lena</option><option value="u2">Bruce</option><option value="u3">Nora</option></select>
          <select className="rounded-lg border border-slate-200 px-2 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as Task["priority"] })}><option value="low">low</option><option value="medium">medium</option><option value="high">high</option><option value="urgent">urgent</option></select>
          <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
        </div>
        <Button onClick={save}>保存任务</Button>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-slate-500">子任务</p>
        <div className="mb-2 flex gap-2">
          <Input value={subtaskTitle} onChange={(e) => setSubtaskTitle(e.target.value)} placeholder="新增子任务" />
          <Button onClick={async () => { if (!subtaskTitle.trim()) return; await patchJson("/api/tasks", { id: task.id, subTaskTitle: subtaskTitle }); setSubtaskTitle(""); qc.invalidateQueries({ queryKey: ["tasks"] }); }}>添加</Button>
        </div>
        <div className="space-y-1">
          {task.subTaskIds.length ? task.subTaskIds.map((id) => <p key={id} className="rounded bg-slate-50 px-2 py-1 text-sm">子任务 #{id}</p>) : <p className="text-sm text-slate-500">暂无子任务</p>}
        </div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-slate-500">附件区（P0 基础占位）</p>
        <div className="rounded-lg border border-dashed border-slate-300 p-3 text-sm text-slate-500">拖拽上传将在 P1 完整实现</div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-slate-500">评论区（支持 @提及）</p>
        <div className="space-y-2">{comments?.items.map((c) => <div key={c.id} className="rounded-lg bg-slate-50 p-2 text-sm" dangerouslySetInnerHTML={{ __html: c.content.replace(/@(\w+)/g, '<span class="text-blue-600 font-medium">@$1</span>') }} />)}</div>
        <div className="mt-3 flex gap-2"><Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="发表评论，支持 @Bruce" /><Button onClick={async () => { if (!comment.trim()) return; await postJson(`/api/tasks/${task.id}/comments`, { content: comment }); setComment(""); qc.invalidateQueries({ queryKey: ["comments", task.id] }); }}>发送</Button></div>
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs text-slate-500">动态记录</p>
        <div className="space-y-1">{activities?.items.map((a) => <p key={a.id} className="text-sm text-slate-600">• {a.message}</p>)}</div>
      </div>
    </div>
  );
}
