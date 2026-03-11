import { notifications } from "@/lib/mock-db";

export async function GET() {
  return Response.json({ items: notifications.filter((n) => n.memberId === "u1") });
}

export async function PATCH(req: Request) {
  const { id } = await req.json();
  const item = notifications.find((n) => n.id === id);
  if (item) item.read = true;
  return Response.json({ item });
}
