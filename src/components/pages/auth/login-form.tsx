"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Button,
  Input,
  Label,
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

const EASE = [0.25, 0.1, 0.25, 1] as const;

const fadeUp = (delay: number = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: EASE, delay },
});

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
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, x: 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <motion.div className="mb-8 text-center" {...fadeUp(0.1)}>
        <Heading size="lg" className="mb-1">
          Welcome back
        </Heading>
        <p className="text-muted-foreground text-sm">
          Sign in to your workspace to continue
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <motion.div className="flex flex-col gap-1.5" {...fadeUp(0.2)}>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            {...register("email")}
          />
          <FormError message={errors.email?.message} />
        </motion.div>

        <motion.div className="flex flex-col gap-1.5" {...fadeUp(0.3)}>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
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
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <FormError message={errors.password?.message} />
        </motion.div>

        <motion.div {...fadeUp(0.4)}>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              "Signing in..."
            ) : (
              <span className="flex items-center gap-2">
                Sign in <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </motion.div>

        <motion.div
          className="flex items-center justify-center gap-3"
          {...fadeUp(0.5)}
        >
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
        </motion.div>
      </form>

      <motion.p
        className="text-center text-muted-foreground text-xs mt-8"
        {...fadeUp(0.6)}
      >
        SOC 2 Type II · GDPR compliant · 256-bit encryption
      </motion.p>
    </motion.div>
  );
};

export default LoginForm;
