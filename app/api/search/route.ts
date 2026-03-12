import { projects, tasks } from "@/lib/mock-db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").toLowerCase();
  const items = [
    ...projects.filter((p) => [p.name,p.code].join(" ").toLowerCase().includes(q)).map((p) => ({ type: "project", id: p.id, label: `${p.name} (${p.code})` })),
    ...tasks.filter((t) => t.title.toLowerCase().includes(q)).map((t) => ({ type: "task", id: t.id, label: t.title }))
  ].slice(0, 8);
  return Response.json({ items });
}
