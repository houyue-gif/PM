import { projectTemplates } from "@/lib/mock-db";

export async function GET() {
  return Response.json({ items: projectTemplates });
}
