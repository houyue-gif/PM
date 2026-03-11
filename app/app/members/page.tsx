"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getJson } from "@/lib/api";

export default function MembersPage() {
  const { data } = useQuery({ queryKey: ["members"], queryFn: () => getJson<{ items: Array<{ id: string; name: string; email: string; role: string }> }>("/app/api/members") });
  const [open, setOpen] = useState(false);

  return (
    <Card title="成员列表" extra={<Button onClick={() => setOpen(true)}>邀请成员</Button>}>
      {data?.items.map((m) => <p className="mb-2 text-sm" key={m.id}>{m.name} · {m.email} · {m.role}</p>)}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-xl bg-white p-4">
            <h3 className="mb-3 text-base font-semibold">邀请新成员</h3>
            <div className="space-y-2"><Input placeholder="邮箱地址" defaultValue="invite@acme.com" /><select className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option>Member</option><option>Project Manager</option><option>Admin</option></select></div>
            <div className="mt-4 flex justify-end gap-2"><button onClick={() => setOpen(false)}>取消</button><Button onClick={() => setOpen(false)}>发送邀请</Button></div>
          </div>
        </div>
      )}
    </Card>
  );
}
