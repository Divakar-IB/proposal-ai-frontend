"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Input,
  Label,
  Checkbox,
  FormError,
  Heading,
} from "@/components/ui";
import { useRouter } from "next/navigation";

const loginSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  remember: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    console.log(data);
    toast.success("Signed in successfully");
    router.push("/all-proposals");
  };

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 text-center">
        <Heading size="lg" className="mb-1">
          Welcome back
        </Heading>
        <p className="text-muted-foreground text-sm">
          Sign in to your workspace to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email" className="">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
          />
          <FormError message={errors.email?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="">
              Password
            </Label>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <FormError message={errors.password?.message} />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            "Signing in..."
          ) : (
            <span className="flex items-center gap-2">
              Sign in <ArrowRight className="w-4 h-4" />
            </span>
          )}
        </Button>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            disabled
            className="text-xs text-primary font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Forgot password?
          </button>
          <span className="text-border text-xs">|</span>
          <Link
            href="/auth/reset-password"
            className="text-xs text-primary font-medium hover:underline"
          >
            Reset password
          </Link>
        </div>
      </form>
      <p className="text-center text-text-subtle text-xs mt-8">
        SOC 2 Type II · GDPR compliant · 256-bit encryption
      </p>
    </div>
  );
};

export default LoginForm;
