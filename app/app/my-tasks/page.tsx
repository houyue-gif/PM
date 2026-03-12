"use client";
import { useState } from "react";
import { TaskModule } from "@/components/tasks/task-module";

export default function MyTasksPage() {
  const [tab, setTab] = useState<"todo"|"owner"|"participant"|"acceptance"|"accepted">("todo");
  return <div className="space-y-3"><div className="flex gap-2 text-sm">{[["todo","待我处理"],["owner","我负责的"],["participant","我参与的"],["acceptance","待我验收"],["accepted","我已验收"]].map(([k,label])=><button key={k} className={`rounded px-3 py-1 ${tab===k?"bg-slate-900 text-white":"bg-slate-100"}`} onClick={()=>setTab(k as any)}>{label}</button>)}</div><TaskModule mineTab={tab} /></div>;
}
