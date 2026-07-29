import { UploadStep } from "@/components/pages/generate-proposals";

const UploadPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <UploadStep proposalId={id} />;
};

export default UploadPage;
