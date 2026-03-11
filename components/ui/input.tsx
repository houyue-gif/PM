import { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn("w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none ring-accent/40 focus:ring", className)} {...props} />;
}
