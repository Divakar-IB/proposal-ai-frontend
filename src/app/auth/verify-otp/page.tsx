import { redirect } from "next/navigation";
import VerifyOtpForm from "@/components/pages/auth/verify-otp-form";

interface Props {
  searchParams: Promise<{ email?: string }>;
}

const VerifyOtpPage = async ({ searchParams }: Props) => {
  const { email } = await searchParams;

  if (!email) redirect("/auth/forgot-password");

  return <VerifyOtpForm email={decodeURIComponent(email)} />;
};

export default VerifyOtpPage;
