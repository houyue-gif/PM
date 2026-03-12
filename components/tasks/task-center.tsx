"use client";

import { TaskModule } from "@/components/tasks/task-module";

export function TaskCenter({ mineOnly = false }: { mineOnly?: boolean }) {
  return <TaskModule mineTab={mineOnly ? "owner" : undefined} />;
}
