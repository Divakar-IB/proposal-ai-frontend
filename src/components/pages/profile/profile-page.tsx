"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Card, Input, Label, FormError, Heading, Skeleton } from "@/components/ui";
import { authService } from "@/services";
import type { AxiosError } from "axios";

type ApiDetailError = AxiosError<{ detail?: string }>;

const profileSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
});
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });
type PasswordValues = z.infer<typeof passwordSchema>;

const getInitials = (name: string | null) =>
  name
    ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

interface PasswordInputProps {
  id: string;
  label: string;
  registration: object;
  error?: string;
}

const PasswordInput = ({ id, label, registration, error }: PasswordInputProps) => {
  const [show, setShow] = useState<boolean>(false);
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? "text" : "password"}
          placeholder="••••••••"
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

const ROLE_LABEL: Record<string, string> = {
  org_admin: "Admin",
  member: "Member",
};

export const ProfilePage = () => {
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => authService.getProfile(),
  });

  const {
    register: regProfile,
    handleSubmit: submitProfile,
    formState: { errors: pErr, isDirty },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    values: profile ? { full_name: profile.full_name ?? "", designation: profile.designation ?? "" } : undefined,
  });

  const {
    register: regPassword,
    handleSubmit: submitPassword,
    formState: { errors: pwErr },
    reset: resetPw,
  } = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
  });

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (d: ProfileValues) => authService.updateProfile({ full_name: d.full_name, designation: d.designation }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Profile updated");
    },
    onError: (err: ApiDetailError) => toast.error(err.response?.data?.detail ?? "Failed to update profile"),
  });

  const { mutate: changePassword, isPending: isChanging } = useMutation({
    mutationFn: (d: PasswordValues) =>
      authService.resetPassword({
        current_password: d.current_password,
        new_password: d.new_password,
        confirm_password: d.confirm_password,
      }),
    onSuccess: () => {
      resetPw();
      toast.success("Password updated successfully");
    },
    onError: (err: ApiDetailError) => toast.error(err.response?.data?.detail ?? "Failed to update password"),
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Heading size="lg">Profile</Heading>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your personal information and password.
        </p>
      </div>

      <div className="flex gap-6 items-start">
      {/* Personal Information */}
      <Card className="flex-1">
        <div className="p-6 flex flex-col gap-5">
          <div className="flex items-center gap-4">
            {isLoading ? (
              <>
                <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3.5 w-52" />
                </div>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-gradient-brand flex items-center justify-center shrink-0 shadow-md">
                  <span className="text-white text-lg font-semibold">
                    {getInitials(profile?.full_name ?? null)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-foreground">{profile?.full_name}</p>
                  <p className="text-muted-foreground text-sm">{profile?.email}</p>
                  {profile?.designation && (
                    <p className="text-xs text-muted-foreground">{profile.designation}</p>
                  )}
                  {profile?.role && (
                    <span className="text-xs text-primary font-medium">
                      {ROLE_LABEL[profile.role] ?? profile.role}
                    </span>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="border-t border-border" />

          <p className="text-sm font-medium text-foreground">Personal information</p>

          <form
            onSubmit={submitProfile((d) => saveProfile(d))}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="full_name">Full name</Label>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Input id="full_name" placeholder="Your full name" {...regProfile("full_name")} />
              )}
              <FormError message={pErr.full_name?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="designation">Designation</Label>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Input id="designation" placeholder="e.g. Senior Sales Manager" {...regProfile("designation")} />
              )}
              <FormError message={pErr.designation?.message} />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              {isLoading ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Input
                  id="email"
                  value={profile?.email ?? ""}
                  readOnly
                  className="cursor-not-allowed bg-muted/50"
                />
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" loading={isSaving} disabled={isLoading || !isDirty}>
                Save changes
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="flex-1">
        <div className="p-6 flex flex-col gap-5">
          <div>
            <p className="text-sm font-medium text-foreground">Change password</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Use a strong password with at least 8 characters, one uppercase letter, and one number.
            </p>
          </div>

          <div className="border-t border-border" />

          <form
            onSubmit={submitPassword((d) => changePassword(d))}
            className="flex flex-col gap-4"
          >
            <PasswordInput
              id="current_password"
              label="Current password"
              registration={regPassword("current_password")}
              error={pwErr.current_password?.message}
            />
            <PasswordInput
              id="new_password"
              label="New password"
              registration={regPassword("new_password")}
              error={pwErr.new_password?.message}
            />
            <PasswordInput
              id="confirm_password"
              label="Confirm new password"
              registration={regPassword("confirm_password")}
              error={pwErr.confirm_password?.message}
            />
            <div className="flex justify-end">
              <Button type="submit" loading={isChanging}>
                Update password
              </Button>
            </div>
          </form>
        </div>
      </Card>
      </div>
    </div>
  );
};
