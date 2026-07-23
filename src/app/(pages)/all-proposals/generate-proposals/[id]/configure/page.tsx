import { ConfigureStep } from "@/components/pages/generate-proposals";

const ConfigurePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <ConfigureStep proposalId={id} />;
};

export default ConfigurePage;
