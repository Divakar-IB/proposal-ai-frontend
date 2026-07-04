import { CapabilitiesStep } from "@/components/pages/generate-proposals";

const CapabilitiesPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <CapabilitiesStep proposalId={id} />;
};

export default CapabilitiesPage;
