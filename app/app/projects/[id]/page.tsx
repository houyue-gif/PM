import { activityLogs, members, projects, tasks } from "@/lib/mock-db";
import { Card } from "@/components/ui/card";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const project = projects.find((p) => p.id === params.id);
  if (!project) return <div className="card p-6">项目不存在</div>;
  return (
    <div className="space-y-4">
      <Card title="项目概览"><p className="text-sm">{project.description}</p><p className="mt-2 text-sm">状态: {project.status} · 健康度: {project.health}</p></Card>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="项目成员管理">{project.memberIds.map((id) => <p key={id} className="text-sm">{members.find((m) => m.id === id)?.name}</p>)}</Card>
        <Card title="项目设置"><p className="text-sm">时间范围：{project.startDate.slice(0,10)} ~ {project.endDate.slice(0,10)}</p></Card>
      </div>
      <Card title="项目动态">{activityLogs.filter((a)=>a.scopeId===project.id || tasks.filter((t)=>t.projectId===project.id).some((t)=>t.id===a.scopeId)).slice(0,8).map((a)=><p key={a.id} className="mb-1 text-sm text-slate-600">{a.message}</p>)}</Card>
    </div>
  );
}
