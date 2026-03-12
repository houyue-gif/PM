import { ProjectDetailCenter } from "@/components/projects/project-detail-center";

export default function ProjectDetailPage({ params, searchParams }: { params: { id: string }; searchParams?: { tab?: "overview" | "plan" | "milestones" | "activities" | "settings" } }) {
  return <ProjectDetailCenter projectId={params.id} initialTab={searchParams?.tab || "overview"} />;
}
