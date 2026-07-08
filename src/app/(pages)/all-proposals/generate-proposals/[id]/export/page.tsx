import { ExportStep } from "@/components/pages/generate-proposals";

const ExportPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <ExportStep proposalId={id} />;
};

export default ExportPage;
