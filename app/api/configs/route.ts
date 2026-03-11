export async function GET() {
  return Response.json({
    statuses: ["todo", "in_progress", "review", "done"],
    priorities: ["low", "medium", "high", "urgent"],
    labels: ["Frontend", "Backend", "Design"]
  });
}
