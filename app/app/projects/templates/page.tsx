"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getJson } from "@/lib/api";
import { ProjectTemplate } from "@/types/domain";

export default function ProjectTemplatesPage() {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const { data } = useQuery({ queryKey: ["project-templates"], queryFn: () => getJson<{ items: ProjectTemplate[] }>("/api/projects/templates") });
  const selected = data?.items.find((t) => t.id === openId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">项目模板</h2>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {data?.items.map((tpl) => (
          <Card key={tpl.id} title={tpl.name}>
            <p className="text-sm text-slate-600">{tpl.description}</p>
            <p className="mt-2 text-xs text-slate-500">适用类型：{tpl.projectType} · {tpl.system ? "系统模板" : "自定义模板"}</p>
            <div className="mt-3 flex gap-2"><Button variant="secondary" onClick={() => setOpenId(tpl.id)}>模板预览</Button><Button onClick={() => router.push(`/app/projects/new?templateId=${tpl.id}`)}>使用此模板</Button></div>
          </Card>
        ))}
      </div>
      {selected && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30"><div className="w-full max-w-xl rounded-xl bg-white p-4"><h3 className="font-semibold">{selected.name}</h3><p className="mt-1 text-sm text-slate-600">{selected.description}</p><p className="mt-3 text-xs text-slate-500">默认阶段：{selected.defaultPhaseNames.join(" / ")}</p><p className="mt-2 text-xs text-slate-500">默认里程碑：{selected.defaultMilestones.map((m)=>m.name).join(" / ")}</p><p className="mt-2 text-xs text-slate-500">默认字段集（基础展示）：标签、风险等级、可见范围</p><div className="mt-4 flex justify-end gap-2"><Button variant="secondary" onClick={()=>setOpenId(null)}>关闭</Button><Button onClick={() => router.push(`/app/projects/new?templateId=${selected.id}`)}>使用模板创建</Button></div></div></div>}
    </div>
  );
}
