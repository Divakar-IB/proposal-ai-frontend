import { GenerateStep } from "@/components/pages/generate-proposals";

const GeneratePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <GenerateStep proposalId={id} />;
};

export default GeneratePage;
