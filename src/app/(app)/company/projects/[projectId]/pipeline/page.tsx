"use client";

import { useParams } from "next/navigation";

import { PipelineBoard } from "@/components/company/pipeline/pipeline-board";

export default function ProjectPipelinePage() {
  const { projectId } = useParams<{ projectId: string }>();
  return <PipelineBoard projectId={Number(projectId)} />;
}
