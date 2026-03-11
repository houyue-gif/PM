import { cn } from "@/lib/utils";

export function Badge({ label, className }: { label: string; className?: string }) {
  return <span className={cn("inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600", className)}>{label}</span>;
}
