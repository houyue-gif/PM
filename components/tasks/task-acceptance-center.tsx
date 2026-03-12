"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getJson, postJson } from "@/lib/api";

export function TaskAcceptanceCenter() {
  const qc = useQueryClient();
  const [done, setDone] = useState(false);
  const [reason, setReason] = useState("");
  const [msg, setMsg] = useState("");
  const { data } = useQuery({ queryKey: ["acceptance", done], queryFn: () => getJson<{ items: any[] }>(`/api/tasks/acceptance?done=${done}`) });
  return (
    <div className="space-y-4">
      {msg && <div className="rounded bg-slate-100 px-3 py-2 text-sm">{msg}</div>}
      <div className="flex items-center gap-2"><Button variant="secondary" onClick={() => setDone(false)}>待我验收</Button><Button variant="secondary" onClick={() => setDone(true)}>我已验收</Button></div>
      <table className="w-full text-sm"><thead><tr><th>任务</th><th>优先级</th><th>截止</th><th>提交时间</th><th>逾期</th><th>操作</th></tr></thead><tbody>{data?.items.map((t) => <tr key={t.id} className="border-t"><td><Link href={`/app/tasks/${t.id}`} className="text-blue-700">{t.title} ({t.taskNo})</Link></td><td>{t.priority}</td><td>{t.plannedEndAt.slice(0,10)}</td><td>{t.actualDoneAt?.slice(0,10) || "-"}</td><td>{t.overdue ? <span className="text-red-600">逾期</span> : "-"}</td><td className="space-x-2">{!done && <><Button onClick={async()=>{await postJson(`/api/tasks/${t.id}/accept`,{comment:"通过"});setMsg("已通过");qc.invalidateQueries({queryKey:["acceptance"]});}}>通过</Button><Input className="inline-flex w-40" placeholder="驳回原因" value={reason} onChange={(e)=>setReason(e.target.value)} /><Button variant="secondary" onClick={async()=>{await postJson(`/api/tasks/${t.id}/reject`,{rejectReason:reason || "需修改"});setMsg("已驳回");qc.invalidateQueries({queryKey:["acceptance"]});}}>驳回</Button></>}</td></tr>)}</tbody></table>
    </div>
  );
}
