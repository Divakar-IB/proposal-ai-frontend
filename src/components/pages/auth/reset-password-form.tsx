"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button, Input, Label, FormError, Heading } from "@/components/ui";

const resetPasswordSchema = z
  .object({
    oldPassword: z.string().min(8, "Password must be at least 8 characters"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    path: ["newPassword"],
    message: "New password must be different from your current password",
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const PasswordInput = ({
  id,
  placeholder,
  registration,
  error,
}: {
  id: string;
  placeholder: string;
  registration: object;
  error?: string;
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder={placeholder}
          className="pr-10"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <FormError message={error} />
    </div>
  );
};

const ResetPasswordForm = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordForm) => {
    console.log(data);
    toast.success("Password updated successfully");
    router.push("/auth/login");
  };

  return (
    <div className="w-full max-w-md">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-8 text-center">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <ShieldCheck className="w-5 h-5 text-primary" />
        </div>
        <Heading size="lg" className="mb-1">
          Reset password
        </Heading>
        <p className="text-muted-foreground text-sm">
          Enter your current password and choose a new one
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="oldPassword">Current password</Label>
          <PasswordInput
            id="oldPassword"
            placeholder="••••••••"
            registration={register("oldPassword")}
            error={errors.oldPassword?.message}
          />
        </div>

        <div className="h-px bg-border" />

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="newPassword">New password</Label>
          <PasswordInput
            id="newPassword"
            placeholder="••••••••"
            registration={register("newPassword")}
            error={errors.newPassword?.message}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            registration={register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button type="submit" className="w-full mt-1" disabled={isSubmitting}>
          {isSubmitting ? "Updating password..." : "Update password"}
        </Button>
      </form>

      <p className="text-center text-text-subtle text-xs mt-8">
        SOC 2 Type II · GDPR compliant · 256-bit encryption
      </p>
    </div>
  );
};

export default ResetPasswordForm;
