"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers";
import { UserRole } from "@/types";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role && role !== UserRole.OrgAdmin) {
      router.replace("/all-proposals");
    }
  }, [role, router]);

  if (role !== UserRole.OrgAdmin) return null;

  return <>{children}</>;
}
