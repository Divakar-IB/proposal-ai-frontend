import { ReviewStep } from "@/components/pages/generate-proposals";

const ReviewPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return <ReviewStep proposalId={id} />;
};

export default ReviewPage;
