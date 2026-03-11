import { members, roles } from "@/lib/mock-db";
export async function GET() { return Response.json({ items: members.map((m)=> ({...m, role: roles.find((r)=>r.id===m.roleId)?.name})) }); }
