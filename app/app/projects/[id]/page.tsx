import { ProjectDetailCenter } from "@/components/projects/project-detail-center";

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  return <ProjectDetailCenter projectId={params.id} />;
}
