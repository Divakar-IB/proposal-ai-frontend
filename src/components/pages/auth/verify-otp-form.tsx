"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button, Heading } from "@/components/ui";
import { authService } from "@/services";
import { cn } from "@/lib/utils";
import type { ApiError } from "@/lib/axios";

interface OtpInputProps {
  value: string;
  onChange: (v: string) => void;
}

const OtpInput = ({ value, onChange }: OtpInputProps) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  const update = (index: number, char: string) => {
    const next = digits.map((d, i) => (i === index ? char : d)).join("");
    onChange(next);
    if (char && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        update(index, "");
      } else if (index > 0) {
        refs.current[index - 1]?.focus();
        update(index - 1, "");
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    refs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center" onPaste={handlePaste}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => update(i, e.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          className={cn(
            "w-12 h-14 text-center text-xl font-semibold rounded-xl border outline-none transition-colors",
            "bg-background text-foreground",
            "border-input focus:border-ring focus:ring-1 focus:ring-ring/30",
          )}
        />
      ))}
    </div>
  );
};

interface VerifyOtpFormProps {
  email: string;
}

const VerifyOtpForm = ({ email }: VerifyOtpFormProps) => {
  const router = useRouter();
  const [otp, setOtp] = useState<string>("");

  const { mutate: verifyOtp, isPending } = useMutation({
    mutationFn: () => authService.verifyOtp({ email, otp }),
    onSuccess: (data) => {
      sessionStorage.setItem("reset_token", data.reset_token);
      toast.success(data.message);
      router.push("/auth/new-password");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Invalid or expired OTP. Please try again.");
    },
  });

  const { mutate: resendOtp, isPending: isResending } = useMutation({
    mutationFn: () => authService.forgotPassword({ email }),
    onSuccess: () => toast.success("OTP resent to your email"),
    onError: (error: ApiError) => toast.error(error.message ?? "Failed to resend OTP"),
  });

  return (
    <div className="w-full max-w-md">
      <Link
        href="/auth/forgot-password"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        ← Back
      </Link>

      <div className="mb-8 text-center">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <Heading size="lg" className="mb-1">Check your email</Heading>
        <p className="text-muted-foreground text-sm">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <OtpInput value={otp} onChange={setOtp} />

        <Button
          className="w-full"
          disabled={otp.length < 6}
          loading={isPending}
          onClick={() => verifyOtp()}
        >
          Verify OTP
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={() => resendOtp()}
            disabled={isResending}
            className="text-primary font-medium hover:underline disabled:opacity-50"
          >
            Resend OTP
          </button>
        </p>
      </div>

      <p className="text-center text-muted-foreground text-xs mt-8">
        SOC 2 Type II · GDPR compliant · 256-bit encryption
      </p>
    </div>
  );
};

export default VerifyOtpForm;
