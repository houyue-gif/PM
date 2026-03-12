"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getJson, postJson } from "@/lib/api";
import { Member, ProjectTemplate, Team } from "@/types/domain";

export function ProjectCreateWizard({ presetTemplate = "" }: { presetTemplate?: string }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<"blank" | "template" | "copy">(presetTemplate ? "template" : "blank");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    templateId: presetTemplate,
    sourceProjectId: "",
    name: "",
    code: "",
    type: "product",
    businessLine: "SaaS",
    ownerId: "u1",
    teamId: "t1",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
    description: "",
    lifecycleTemplate: "标准生命周期",
    enableMilestones: true,
    enableRiskTracking: true,
    visibility: "workspace"
  });

  const { data: base } = useQuery({ queryKey: ["project-create-base"], queryFn: () => getJson<{ options: { members: Member[]; teams: Team[] } }>("/api/projects") });
  const { data: templates } = useQuery({ queryKey: ["project-templates"], queryFn: () => getJson<{ items: ProjectTemplate[] }>("/api/projects/templates") });

  const validateStep1 = () => {
    if (!form.name.trim() || !form.code.trim() || !form.ownerId) return "请填写名称、编码和负责人";
    if (new Date(form.startDate) > new Date(form.endDate)) return "开始日期不能晚于结束日期";
    return "";
  };

  const create = async () => {
    const err = validateStep1();
    if (err) return setError(err);
    setError("");
    try {
      const res = await postJson<{ item: { id: string } }>("/api/projects", { ...form, mode });
      router.push(`/app/projects/${res.item.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "创建失败");
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <Card title="新建项目">
        <div className="mb-4 flex gap-2 text-sm">
          {(["blank", "template", "copy"] as const).map((m) => <button key={m} className={`rounded px-3 py-1 ${mode === m ? "bg-slate-900 text-white" : "bg-slate-100"}`} onClick={() => setMode(m)}>{m === "blank" ? "空白创建" : m === "template" ? "模板创建" : "复制创建"}</button>)}
        </div>

        {mode === "template" && (
          <div className="mb-4">
            <p className="mb-2 text-sm font-medium">选择模板</p>
            <div className="grid gap-2 md:grid-cols-2">
              {templates?.items.map((t) => (
                <button key={t.id} onClick={() => setForm({ ...form, templateId: t.id, type: t.projectType })} className={`rounded-lg border p-3 text-left ${form.templateId === t.id ? "border-slate-900" : "border-slate-200"}`}>
                  <p className="font-medium">{t.name}</p><p className="text-xs text-slate-500">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <Input placeholder="项目名称*" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Input placeholder="项目编码*" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            <div className="grid grid-cols-2 gap-2">
              <select className="rounded border px-2 py-2 text-sm" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="product">产品</option><option value="delivery">交付</option><option value="ops">运维</option><option value="research">研究</option></select>
              <Input placeholder="业务线" value={form.businessLine} onChange={(e) => setForm({ ...form, businessLine: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <select className="rounded border px-2 py-2 text-sm" value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>{base?.options.members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}</select>
              <select className="rounded border px-2 py-2 text-sm" value={form.teamId} onChange={(e) => setForm({ ...form, teamId: e.target.value })}>{base?.options.teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
            </div>
            <div className="grid grid-cols-2 gap-2"><Input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /><Input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
            <Input placeholder="项目描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 text-sm">
            <Input placeholder="生命周期模板" value={form.lifecycleTemplate} onChange={(e) => setForm({ ...form, lifecycleTemplate: e.target.value })} />
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.enableMilestones} onChange={(e) => setForm({ ...form, enableMilestones: e.target.checked })} /> 启用里程碑</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.enableRiskTracking} onChange={(e) => setForm({ ...form, enableRiskTracking: e.target.checked })} /> 启用风险跟踪</label>
            <div className="rounded border border-dashed p-2 text-xs text-slate-500">版本/迭代配置已预留（P1）</div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <select className="rounded border px-2 py-2" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}><option value="workspace">全工作区可见</option><option value="team">仅团队可见</option><option value="private">仅成员可见</option></select>
            <div className="rounded border p-2 text-xs text-slate-600">默认成员组：项目负责人所在团队</div>
            <div className="rounded border p-2 text-xs text-slate-600">默认通知规则：里程碑到期、延期预警、负责人变更</div>
            <div className="rounded border border-dashed p-2 text-xs text-slate-500">自动化规则 / 字段模板（P1预留）</div>
          </div>
        )}

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <div className="mt-4 flex justify-between">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))}>上一步</Button>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={create}>最小字段快速创建</Button>
            {step < 3 ? <Button onClick={() => { const err = step === 1 ? validateStep1() : ""; if (err) return setError(err); setError(""); setStep(step + 1); }}>下一步</Button> : <Button onClick={create}>创建项目</Button>}
          </div>
        </div>
      </Card>

      <Card title="实时预览">
        <p className="text-sm font-medium">{form.name || "未命名项目"}</p>
        <p className="text-xs text-slate-500">编码：{form.code || "AUTO"}</p>
        <p className="mt-2 text-xs text-slate-500">类型：{form.type} · 可见范围：{form.visibility}</p>
        <p className="mt-2 text-xs text-slate-500">时间：{form.startDate} ~ {form.endDate}</p>
        <p className="mt-4 text-xs text-slate-500">创建后将进入项目详情页的「概览」Tab。</p>
      </Card>
    </div>
  );
}
