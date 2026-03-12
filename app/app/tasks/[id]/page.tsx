import { TaskDetailCenter } from "@/components/tasks/task-detail-center";
export default function TaskDetailPage({ params }: { params: { id: string } }) { return <TaskDetailCenter id={params.id} />; }
