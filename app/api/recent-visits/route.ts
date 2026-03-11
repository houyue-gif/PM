import { recentVisits } from "@/lib/mock-db";

export async function GET() {
  return Response.json({ items: recentVisits.filter((v) => v.memberId === "u1") });
}
