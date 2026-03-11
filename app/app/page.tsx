import { Card } from "@/components/ui/card";
import { projects, tasks, activityLogs } from "@/lib/mock-db";

export default function DashboardPage() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Card title="我的待办">{tasks.filter((t) => t.assigneeId === "u1" && t.status !== "done").map((t) => <p key={t.id} className="mb-2 text-sm">• {t.title}</p>)}</Card>
      <Card title="我负责的项目">{projects.filter((p) => p.ownerId === "u1").map((p) => <p key={p.id} className="mb-2 text-sm">{p.name}</p>)}</Card>
      <Card title="即将到期任务">{tasks.slice(0,3).map((t) => <p key={t.id} className="mb-2 text-sm">{t.title} · {t.dueDate.slice(0,10)}</p>)}</Card>
      <Card title="快捷入口"><p className="text-sm">+ 新建项目 / + 新建任务</p></Card>
      <div className="md:col-span-2 xl:col-span-4">
        <Card title="最近动态">{activityLogs.slice(0,6).map((a) => <p key={a.id} className="mb-2 text-sm text-slate-600">{a.message}</p>)}</Card>
      </div>
    </div>
  );
}
