import { ProjectCreateWizard } from "@/components/projects/project-create-wizard";

export default function NewProjectPage({ searchParams }: { searchParams?: { templateId?: string } }) {
  return <ProjectCreateWizard presetTemplate={searchParams?.templateId || ""} />;
}
