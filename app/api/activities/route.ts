import { activityLogs } from "@/lib/mock-db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scopeId = searchParams.get("scopeId");
  const items = scopeId ? activityLogs.filter((a) => a.scopeId === scopeId) : activityLogs;
  return Response.json({ items: items.slice(0, 20) });
}
