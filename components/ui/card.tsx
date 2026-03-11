import { ReactNode } from "react";

export function Card({ title, extra, children }: { title: string; extra?: ReactNode; children: ReactNode }) {
  return (
    <section className="card p-4">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {extra}
      </header>
      {children}
    </section>
  );
}
