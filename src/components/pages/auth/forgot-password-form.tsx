"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Label, FormError, Heading } from "@/components/ui";
import { authService } from "@/services";
import type { ApiError } from "@/lib/axios";

const schema = z.object({
  email: z.email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

const ForgotPasswordForm = () => {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { mutate: sendOtp, isPending } = useMutation({
    mutationFn: (data: FormValues) => authService.forgotPassword({ email: data.email }),
    onSuccess: (_, variables) => {
      toast.success("OTP sent! Please check your email inbox.");
      router.push(`/auth/verify-otp?email=${encodeURIComponent(variables.email)}`);
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to send OTP. Please try again.");
    },
  });

  return (
    <div className="w-full max-w-md">
      <Link
        href="/auth/login"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>

      <div className="mb-8 text-center">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <Mail className="w-5 h-5 text-primary" />
        </div>
        <Heading size="lg" className="mb-1">Forgot password</Heading>
        <p className="text-muted-foreground text-sm">
          Enter your email address and we&apos;ll send you a one-time password.
        </p>
      </div>

      <form onSubmit={handleSubmit((data) => sendOtp(data))} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
          />
          <FormError message={errors.email?.message} />
        </div>

        <Button type="submit" className="w-full" loading={isPending}>
          Send OTP
        </Button>
      </form>

      <p className="text-center text-muted-foreground text-xs mt-8">
        SOC 2 Type II · GDPR compliant · 256-bit encryption
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
