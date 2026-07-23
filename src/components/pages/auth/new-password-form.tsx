"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { Button, Input, Label, FormError, Heading } from "@/components/ui";
import { authService } from "@/services";
import type { ApiError } from "@/lib/axios";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

const PasswordInput = ({
  id,
  label,
  placeholder,
  registration,
  error,
}: {
  id: string;
  label: string;
  placeholder: string;
  registration: object;
  error?: string;
}) => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      <FormError message={error} />
    </div>
  );
};

const NewPasswordForm = () => {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const { mutate: setPassword, isPending } = useMutation({
    mutationFn: (data: FormValues) => {
      const reset_token = sessionStorage.getItem("reset_token") ?? "";
      return authService.setNewPassword({ reset_token, new_password: data.newPassword });
    },
    onSuccess: (data) => {
      sessionStorage.removeItem("reset_token");
      toast.success(data.message);
      router.push("/auth/login");
    },
    onError: (error: ApiError) => {
      toast.error(error.message ?? "Failed to update password. Please try again.");
    },
  });

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center mb-4 mx-auto">
          <KeyRound className="w-5 h-5 text-primary" />
        </div>
        <Heading size="lg" className="mb-1">Set new password</Heading>
        <p className="text-muted-foreground text-sm">
          Choose a strong password for your account.
        </p>
      </div>

      <form onSubmit={handleSubmit((d) => setPassword(d))} className="flex flex-col gap-5">
        <PasswordInput
          id="newPassword"
          label="New password"
          placeholder="••••••••"
          registration={register("newPassword")}
          error={errors.newPassword?.message}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm new password"
          placeholder="••••••••"
          registration={register("confirmPassword")}
          error={errors.confirmPassword?.message}
        />

        <ul className="flex flex-col gap-1 text-xs text-muted-foreground list-disc list-inside">
          <li>At least 8 characters</li>
        </ul>

        <Button type="submit" className="w-full" loading={isPending}>
          Update password
        </Button>
      </form>

      <p className="text-center text-muted-foreground text-xs mt-8">
        SOC 2 Type II · GDPR compliant · 256-bit encryption
      </p>
    </div>
  );
};

export default NewPasswordForm;
