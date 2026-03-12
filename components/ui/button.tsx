import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Button({ className, variant = "primary", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" }) {
  return <button className={cn("rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50", variant === "primary" ? "bg-accent text-white hover:bg-blue-700" : "bg-slate-100 text-slate-700 hover:bg-slate-200", className)} {...props} />;
}
