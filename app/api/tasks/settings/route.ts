import { prisma } from "@/lib/prisma";

const defaults = {
  statusFlow: ["not_started", "in_progress", "blocked", "pending_acceptance", "completed", "closed"],
  acceptanceRules: { forceAcceptor: true, rejectBackTo: "in_progress", requireKeySubtasks: false },
  ganttRules: { forceStartTime: true, parentChildLinked: true, forbidChildOverflow: true },
  fieldToggles: { owner: true, acceptor: true, time: true, priority: true, risk: true, predecessor: true, description: true }
};

export async function GET() {
  const rows = await prisma.taskSetting.findMany();
  const map: any = {};
  rows.forEach((r) => (map[r.key] = JSON.parse(r.value)));
  return Response.json({ ...defaults, ...map });
}

export async function PATCH(req: Request) {
  const payload = await req.json();
  for (const [key, value] of Object.entries(payload)) {
    await prisma.taskSetting.upsert({ where: { key }, create: { key, value: JSON.stringify(value) }, update: { value: JSON.stringify(value) } });
  }
  return Response.json({ ok: true });
}
