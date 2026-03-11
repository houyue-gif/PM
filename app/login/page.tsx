"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">项目管理平台</h1>
        <p className="mb-6 text-sm text-slate-500">P0 版本演示登录（Mock）</p>
        <div className="space-y-3">
          <Input defaultValue="lena@acme.com" />
          <Input defaultValue="******" type="password" />
          <Button className="w-full" onClick={() => router.push("/app")}>进入平台</Button>
        </div>
      </div>
    </div>
  );
}
