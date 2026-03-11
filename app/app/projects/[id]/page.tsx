"use client";

import { useMemo, useState } from "react";
import { activityLogs, members, projects, tasks } from "@/lib/mock-db";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Tab = "overview" | "tasks" | "activity" | "settings";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [name, setName] = useState(project?.name || "");
  const [desc, setDesc] = useState(project?.description || "");

  const projectTasks = useMemo(() => tasks.filter((t) => t.projectId === project?.id), [project?.id]);
  const projectActivity = useMemo(
    () => activityLogs.filter((a) => a.scopeId === project?.id || projectTasks.some((t) => t.id === a.scopeId)).slice(0, 10),
    [project?.id, projectTasks]
  );

  if (!project) return <div className="card p-6">项目不存在</div>;

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "overview", label: "概览" },
    { key: "tasks", label: "任务" },
    { key: "activity", label: "动态" },
    { key: "settings", label: "设置" }
  ];

  return (
    <div className="space-y-4">
      <div className="card flex items-center justify-between p-3">
        <div>
          <p className="text-base font-semibold">{project.name}</p>
          <p className="text-xs text-slate-500">项目内导航</p>
        </div>
        <div className="flex gap-2">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-md px-3 py-1.5 text-sm ${tab === t.key ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && (
        <>
          <Card title="项目概览" extra={<Button onClick={() => setEditing(true)}>编辑项目</Button>}>
            <p className="text-sm">{project.description}</p>
            <p className="mt-2 text-sm">状态: {project.status} · 健康度: {project.health}</p>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card title="项目成员管理">{project.memberIds.map((id) => <p key={id} className="text-sm">{members.find((m) => m.id === id)?.name}</p>)}</Card>
            <Card title="时间范围"><p className="text-sm">{project.startDate.slice(0, 10)} ~ {project.endDate.slice(0, 10)}</p></Card>
          </div>
        </>
      )}

      {tab === "tasks" && <Card title="项目任务">{projectTasks.map((t) => <div key={t.id} className="mb-2 rounded-lg border border-slate-200 p-2 text-sm">{t.title} · {t.status}</div>)}</Card>}
      {tab === "activity" && <Card title="项目动态">{projectActivity.map((a) => <p key={a.id} className="mb-1 text-sm text-slate-600">{a.message}</p>)}</Card>}
      {tab === "settings" && <Card title="项目设置"><p className="text-sm text-slate-600">项目状态流、优先级策略、标签规则（P0 简化）。</p></Card>}

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-lg rounded-xl bg-white p-4">
            <h3 className="mb-3 font-semibold">编辑项目基础信息</h3>
            <div className="space-y-2"><Input value={name} onChange={(e) => setName(e.target.value)} /><Input value={desc} onChange={(e) => setDesc(e.target.value)} /></div>
            <div className="mt-4 flex justify-end gap-2"><button onClick={() => setEditing(false)}>取消</button><Button onClick={() => { project.name = name; project.description = desc; setEditing(false); }}>保存</Button></div>
          </div>
        </div>
      )}
    </div>
  );
}
