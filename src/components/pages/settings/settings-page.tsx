"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Building2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Card, Input, Label, FormError, Heading, Skeleton } from "@/components/ui";
import { orgService } from "@/services";
import { useAuth } from "@/providers";
import { UserRole } from "@/types";
import type { ApiError } from "@/lib/axios";

const schema = z.object({
  name: z.string().min(1, "Organisation name is required"),
  contact_email: z.string().email("Enter a valid email").or(z.literal("")).optional(),
  default_signee_name: z.string().optional(),
  default_signee_designation: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export const SettingsPage = () => {
  const router = useRouter();
  const { role } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (role && role !== UserRole.OrgAdmin) router.replace("/all-proposals");
  }, [role, router]);

  const { data: org, isLoading } = useQuery({
    queryKey: ["org-profile"],
    queryFn: () => orgService.getProfile(),
    enabled: role === UserRole.OrgAdmin,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: org
      ? {
          name: org.name,
          contact_email: org.contact_email ?? "",
          default_signee_name: org.default_signee_name ?? "",
          default_signee_designation: org.default_signee_designation ?? "",
        }
      : undefined,
  });

  const { mutate: saveProfile, isPending: isSaving } = useMutation({
    mutationFn: (d: FormValues) =>
      orgService.updateProfile({
        name: d.name,
        contact_email: d.contact_email || undefined,
        default_signee_name: d.default_signee_name || undefined,
        default_signee_designation: d.default_signee_designation || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-profile"] });
      toast.success("Organisation settings saved");
    },
    onError: (err: ApiError) => toast.error(err.message ?? "Failed to save settings"),
  });

  const { mutate: uploadLogo, isPending: isUploadingLogo } = useMutation({
    mutationFn: (file: File) => orgService.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-profile"] });
      setLogoFile(null);
      setLogoPreview(null);
      toast.success("Logo updated");
    },
    onError: (err: ApiError) => toast.error(err.message ?? "Failed to upload logo"),
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!role || role !== UserRole.OrgAdmin) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <Heading size="lg">Settings</Heading>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your organisation profile and branding.
        </p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Organisation Info */}
        <Card className="flex-1">
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Organisation information</p>
            </div>

            <div className="border-t border-border" />

            <form
              onSubmit={handleSubmit((d) => saveProfile(d))}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Organisation name</Label>
                {isLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Input id="name" placeholder="Acme Corp" {...register("name")} />
                )}
                <FormError message={errors.name?.message} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="contact_email">Contact email</Label>
                {isLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Input
                    id="contact_email"
                    type="email"
                    placeholder="contact@company.com"
                    {...register("contact_email")}
                  />
                )}
                <FormError message={errors.contact_email?.message} />
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="default_signee_name">Default signee name</Label>
                {isLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Input
                    id="default_signee_name"
                    placeholder="John Smith"
                    {...register("default_signee_name")}
                  />
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="default_signee_designation">Default signee designation</Label>
                {isLoading ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Input
                    id="default_signee_designation"
                    placeholder="Chief Executive Officer"
                    {...register("default_signee_designation")}
                  />
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" loading={isSaving} disabled={isLoading}>
                  Save changes
                </Button>
              </div>
            </form>
          </div>
        </Card>

        {/* Logo */}
        <Card className="w-64 shrink-0">
          <div className="p-6 flex flex-col gap-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Upload className="w-4 h-4 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">Organisation logo</p>
            </div>

            <div className="border-t border-border" />

            <p className="text-xs text-muted-foreground">
              Appears on all generated proposal cover pages. PNG or JPG, max 2 MB.
            </p>

            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex items-center justify-center bg-muted/40 overflow-hidden relative">
                {logoPreview || org?.logo_url ? (
                  <Image
                    src={logoPreview ?? org!.logo_url!}
                    alt="Logo preview"
                    fill
                    unoptimized
                    className="object-contain p-2"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-muted-foreground/40" />
                )}
              </div>

              {logoPreview ? (
                <div className="flex flex-col gap-2 w-full">
                  <Button
                    type="button"
                    className="w-full"
                    loading={isUploadingLogo}
                    onClick={() => logoFile && uploadLogo(logoFile)}
                  >
                    Upload logo
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full text-muted-foreground"
                    onClick={clearLogo}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {org?.logo_url ? "Change logo" : "Upload logo"}
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleLogoChange}
            />
          </div>
        </Card>
      </div>
    </div>
  );
};
