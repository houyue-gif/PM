"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getJson, postJson } from "@/lib/api";
import { Project } from "@/types/domain";

export function ProjectList() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["projects"], queryFn: () => getJson<{ items: Project[] }>("/app/api/projects") });

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button onClick={() => setOpen(true)}>新建项目</Button></div>
      <div className="grid gap-3 md:grid-cols-2">{data?.items.map((p) => <Card key={p.id} title={p.name}><p className="mb-3 text-sm text-slate-600">{p.description}</p><Link className="text-sm text-blue-600" href={`/app/projects/${p.id}`}>进入项目概览</Link></Card>)}</div>
      {open && <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/30"><div className="w-full max-w-md rounded-xl bg-white p-4"><h3 className="mb-3 font-semibold">新建项目</h3><div className="space-y-2"><Input placeholder="项目名称" value={name} onChange={(e)=>setName(e.target.value)} /><Input placeholder="项目描述" value={desc} onChange={(e)=>setDesc(e.target.value)} /></div><div className="mt-4 flex justify-end gap-2"><button onClick={()=>setOpen(false)}>取消</button><Button onClick={async()=>{await postJson('/app/api/projects',{name,description:desc});setOpen(false);setName('');setDesc('');qc.invalidateQueries({queryKey:['projects']});}}>创建</Button></div></div></div>}
    </div>
  );
}
